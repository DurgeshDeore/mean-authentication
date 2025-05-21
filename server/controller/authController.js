import bcrypt, { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async(req, res)=>{
    const {name, email, password} = req.body;
    
    if(!name || ! email || !password){
         return res.json({ success: false, message : "Missing Details"})
    }

    try{
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success: false, message: "User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:  7* 24* 60* 60* 1000
        });

        // greeting mail 
        const mailOptions  = {
            from : process.env.SENDER_EMAIL,
            to : email,
            subject : 'welcome to the LitCode',
            text : `Your account has been created with ${email}.`
        }

        // await transporter.sendMail(mailOptions);
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Email send error:', emailError);
        }

        return res.json({success: true})

    }catch(error){
        res.json({success: false, message: error.message})
    }
}

export const login = async(req, res)=> {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.json({success: false, message: "Email and Password requred !"})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "Invalid Email"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: "Invalid Password"})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:  7* 24* 60* 60* 1000
        });


        return res.json({success: true})

    }catch(error){
        res.json({success: false, message: error.message})
    }

}

export const logout = async (req, res) =>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        return res.json({success: true, message: "Logged out"})
    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

//send verifiction otp 
export const sendVerifyOtp = async(req,res)=>{
    try{
        const userId = req.user.id; // from middleware
        const user = await userModel.findById(userId);
        // if(user.isAccountVerified === false){
        //     return res.json({ success: false, message: "Account is arready verified!"})
        // }
        if(!user){
            return res.json({ success: false, message: "Could not find the user!"})
        }
        const otp = String(Math.floor(1000 + Math.random() *9000 ));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60* 60* 1000; //one day expiry
        await user.save();

        // formated date 
        const expiryDate = new Date(user.verifyOtpExpireAt);
        const formattedDate = expiryDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
        
        const mailOptions  = {
            from : process.env.SENDER_EMAIL,
            to : user.email,
            subject : 'Account verification OTP',
            text : `Your account verifiction OTP is ${otp}. Use this OTP before ${formattedDate}`
        }
        try {
            await transporter.sendMail(mailOptions);
            console.log('OTP sent successfully');
        } catch (emailError) {
            console.error('OTP mail send error:', emailError);
        }

        res.json({success: true, message: "Account verification mail has been send"});

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

//verify the user using otp
export const verifyEmail = async(req, res)=>{
    try{   
        console.log("Request body:", req.body);
        const userId = req.user.id;
        const {otp} = req.body;
        if((!userId || !otp)){
            return res.json({success: false, message: "Missing detailes"});
        }
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success: false, message: "User is missing!"})
        }
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"});
        }   
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP expired"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;
        await user.save();
        res.json({success: true, message: "Account verified successfully"});

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}

//check the user is aiuthenticate ro not 
export const isAuthenticate = async (req, res)=>{
    try {
        const userId = req.body.id;
        const user = await userModel.findOne(userId);
        if(!user){
            return res.json({success: "false", message: "User is not exists"});
        }
        if(!user.isAccountVerified){
            return res.json({success: "false", message: "User is not Veirified!"});
        }
        return res.json({success: "true", message: "User is Authenticated!"});
    } catch (error) {
        return res.json({success : "false", message: error.message});
    }
}

//reset opt
export const resetOtp = async (req, res) => {
    try {
        const userId = req.user.id; // Using the authenticated user's ID from middleware
        const user = await userModel.findById(userId);
        
        if(!user){
            return res.status(404).json({success: false, message: "User does not exist"});
        }

        const otp = String(Math.floor(1000 + Math.random() * 9000));
        user.verifyOtp = otp;
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // one day expiry
        await user.save();

        // formated date 
        const expiryDate = new Date(user.verifyOtpExpireAt);
        const formattedDate = expiryDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP resend',
            text: `Your account verification OTP is ${otp}. Use this OTP before ${formattedDate}`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('OTP sent successfully');
            return res.json({success: true, message: "OTP has been reset and sent to your email"});
        } catch (emailError) {
            console.error('OTP mail send error:', emailError);
            return res.status(500).json({success: false, message: "Failed to send OTP email"});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}

//reset pass
export const resetPass = async (req, res) => {
    try {
        const userId = req.user.id; 
        const {newPass} = req.body;
        
        const user = await userModel.findById(userId);
        
        if(!user){
            return res.status(404).json({success: false, message: "User does not exist"});
        }
        const hashedPassword = await bcrypt.hash(newPass, 10);
        user.password = hashedPassword;
        await user.save();

        // formated date 
        const curDate = new Date(Date.now());
        const formattedDate = curDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Password is Reset',
            text: `Your account Password is reset at ${formattedDate}`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('OTP sent successfully');
            return res.json({success: true, message: "Email Send!"});
        } catch (emailError) {
            console.error('OTP mail send error:', emailError);
            return res.status(500).json({success: false, message: "Failed to send email"});
        }
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}