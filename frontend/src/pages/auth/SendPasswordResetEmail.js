import { Typography, TextField, Button, Box, Alert } from "@mui/material"
import { useState } from "react"
import { useSendPasswordResetEmailMutation } from "../../services/userAuthApi"

const SendPasswordResetEmail = () => {
  const [server_error, setServerError] = useState({})
  const [server_msg, setServerMsg] = useState({})
  const [sendPasswordResetEmail] = useSendPasswordResetEmailMutation()
  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const actualData = {
      email: data.get('email')
    }
    const res = await sendPasswordResetEmail(actualData)
    if(res.error){
      setServerMsg({})
      setServerError(res.error.data)
    }
    if(res.data){
      setServerError({})
      setServerMsg(res.data)
      document.getElementById("password-reset-email-form").reset()
    }
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "2rem" }}>
      <Box sx={{ display: "flex", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", flexDirection: "column", flexWrap: "wrap", maxWidth: 500, width: "100%", mx: "auto", padding: '2rem', borderRadius: '0.3rem' }}>
        <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '20px' }}>تغییر رمز عبور</Typography>
        <Box component='form' noValidate sx={{ mt: 1 }} id='password-reset-email-form' onSubmit={handleSubmit}>
          <TextField margin="normal" required fullWidth id='email' name='email' label='ایمیل' dir="ltr" sx={{ pb: 2 }} />
          {server_error.email ? (
            <Typography style={{ fontSize: 12, color: 'red', paddingLeft: 10, marginTop: 5 }}> 
              {server_error.email[0]}
            </Typography>
          ) : (
            ""
          )}
          <Box textAlign='center'>
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, px: 5, backgroundColor: "#3f51b5", color: "#fff", "&:hover": { backgroundColor: "#2c387e" } }}>ارسال</Button>
          </Box>
          {server_error.non_field_errors ? (
            <Alert severity="error" style={{ marginTop: 10, direction: 'rtl' }}>{server_error.non_field_errors[0]}</Alert>
          ) : (
            ""
          )}
          {server_msg.msg ? (
            <Alert severity="success" style={{ marginTop: 10, direction: 'rtl' }}>{server_msg.msg}</Alert>
          ) : (
            ""
          )}
        </Box>
      </Box>
    </div>
  )
}

export default SendPasswordResetEmail; 