import { TextField, Button, Box, Checkbox, Alert, FormControlLabel, Typography, Tooltip  } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRegisterUserMutation } from "../../services/userAuthApi"
import { storeToken } from "../../services/LocalStorageService"

const Registration = () => {
    const [server_error, setServerError] = useState({})
    const navigate = useNavigate()
    const [registerUser, {isLoading}] = useRegisterUserMutation()
    const customErrorMessages = {
        'This field may not be blank.': 'این فیلد نمی‌تواند خالی باشد.',
        'Enter a valid email address.': 'لطفاً یک آدرس ایمیل معتبر وارد کنید.',
        'user with this Email already exists.': 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است.',
        'This field may not be null.' : 'لطفاً با شرایط و قوانین موافقت کنید.',
    };
    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const actualData = {
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
            password2: data.get('password2'),
            tc: data.get('tc')
        }
        const res = await registerUser(actualData)
        if(res.error){
            setServerError(res.error.data)
            console.log(server_error)
        }
        if(res.data){
            storeToken(res.data.token)
            navigate('/dashboard')            
        }
    }

    const translateErrorMessage = (message) => {
        return customErrorMessages[message] || message;
    };

    const termsAndConditions = `
    شرایط و قوانین استفاده از سایت:
    ۱. شما مسئولیت هرگونه اطلاعاتی که در تقویم و لیست وظایف خود وارد می‌کنید را دارید.
    ۲. شما می‌پذیرید که از این تقویم و لیست وظایف به صورت مشروع و مجاز استفاده کنید و هیچ اقدامی که به قوانین نقضی تجارت الکترونیک نباشد انجام نخواهید داد.
    ۳. ما هیچ گونه مسئولیتی در قبال از دست رفتن اطلاعات یا مشکلات فنی ناشی از استفاده از تقویم و لیست وظایف نداریم.
    ۴. شما می‌توانید در هر زمان حساب کاربری خود را حذف کنید و اطلاعات شما از سرورهای ما پاک خواهد شد.
    ۵. اطلاعات و رویدادهای شما در تقویم و لیست وظایف شخصی شما نگهداری می‌شوند و به دیگران ارسال نخواهند شد.
    `;

    return (
        <>
            <Box dir="rtl" component='form' noValidate sx={{ mt: 1 }} id='registration-form' onSubmit={handleSubmit}>
                <TextField margin='normal' required fullWidth id='name' name='name' label='نام' dir="ltr" />
                {server_error.name?<Typography style={{fontSize:12, color:'red', paddingLeft:10}}>{translateErrorMessage(server_error.name[0])}</Typography>:""}
                <TextField margin='normal' required fullWidth id='email' name='email' label='ایمیل' dir="ltr" />
                {server_error.email?<Typography style={{fontSize:12, color:'red', paddingLeft:10}}>{translateErrorMessage(server_error.email[0])}</Typography>:""}
                <TextField margin='normal' required fullWidth id='password' name='password' label='رمز' type='password' dir="ltr"/>
                {server_error.password?<Typography style={{fontSize:12, color:'red', paddingLeft:10}}>{translateErrorMessage(server_error.password[0])}</Typography>:""}
                <TextField margin='normal' required fullWidth id='password2' name='password2' label='تکرار رمز' type='password' dir="ltr"/>
                {server_error.password2?<Typography style={{fontSize:12, color:'red', paddingLeft:10}}>{translateErrorMessage(server_error.password2[0])}</Typography>:""}
                <FormControlLabel control={<Checkbox dir="rtl" value={true} color="primary" name="tc" id="tc" />} dir="rtl" label={
                    <Tooltip title={<div style={{ whiteSpace: 'pre-line', direction: 'rtl' }}>{termsAndConditions}</div>} arrow>
                    <span>با شرایط و قوانین موافقم.</span>
                </Tooltip>
                        } />
                {server_error.tc?<span style={{fontSize:12, color:'red', paddingLeft:10}}><br />{translateErrorMessage(server_error.tc[0])}</span>:""}
                <Box textAlign='center'>
                    <Button type='submit' variant='contained' sx={{ mt: 3, mb: 2, px: 5 }}>ثبت نام</Button>
                </Box>
                {server_error.non_field_errors ? <Alert severity='error'>{server_error.non_field_errors[0]}</Alert> : ''}
            </Box>
        </>
    )
}

export default Registration