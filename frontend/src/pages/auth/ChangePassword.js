import { Typography, TextField, Button, Box, Alert } from "@mui/material"
import { useState, useEffect } from "react"
import { useChangeUserPasswordMutation } from "../../services/userAuthApi"
import { getToken } from "../../services/LocalStorageService"

const ChangePassword = () => {
  const [server_error, setServerError] = useState({})
  const [server_msg, setServerMsg] = useState({})
  const [changepassword] = useChangeUserPasswordMutation()
  const {access_token} = getToken()
  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const actualData = {
      password: data.get('password'),
      password2: data.get('password2'),
    }
    const res = await changepassword({actualData, access_token})
    if(res.error){
      setServerMsg({})
      setServerError(res.error.data)
    }
    if(res.data){
      setServerError({})
      setServerMsg(res.data)
      document.getElementById("password-change-form").reset()
    }
  }

  useEffect(() => {
    if (access_token) {
      console.log(window.location.pathname)
      localStorage.setItem('lastLocation', window.location.pathname);
    }
  }, [access_token]);
  
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5",
      marginRight: '-108px',
      marginTop: '-17px',
       }}>
      <Box sx={{ display: "flex", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", flexDirection: "column", flexWrap: "wrap", maxWidth: 600, mx: 4, padding: '2rem', borderRadius: '0.3rem' }}>
        <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '20px' }}>تغییر رمز عبور</Typography>
        <Box component='form' noValidate sx={{ mt: 1 }} id='password-change-form' onSubmit={handleSubmit}>
          <TextField margin="normal" required fullWidth id='password' name='password' label='رمز عبور جدید' type="password" dir="ltr" sx={{ pb: 2 }} />
          {server_error.password ? (
            <Typography style={{ fontSize: 12, color: 'red', paddingLeft: 10, marginTop: 5 }}>
              {server_error.password[0]}
            </Typography>
          ) : (
            ""
          )}
          <TextField margin="normal" required fullWidth id='password2' name='password2' label='تکرار رمز عبور جدید' type="password" dir="ltr" sx={{ pb: 2 }} />
          {server_error.password2 ? (
            <Typography style={{ fontSize: 12, color: 'red', paddingLeft: 10, marginTop: 5 }}>
              {server_error.password2[0]}
            </Typography>
          ) : (
            ""
          )}
          <Box textAlign='center'>
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, px: 5, backgroundColor: "#3f51b5", color: "#fff", "&:hover": { backgroundColor: "#2c387e" } }}>ویرایش</Button>
          </Box>
          {server_error.non_field_errors ? (
            <Alert severity="error" style={{ marginTop: 10, direction: 'rtl' }}>{server_error.non_field_errors[0]}</Alert>
          ) : (
            ""
          )}
          {server_msg.msg ? <Alert severity="success" style={{ marginTop: 10, direction: 'rtl' }}>{server_msg.msg}</Alert> : ""}
        </Box>
      </Box>
    </div>
  )
}

export default ChangePassword