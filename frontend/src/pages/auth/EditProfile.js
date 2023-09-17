import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Box, Alert } from "@mui/material";
import { useSelector } from "react-redux";
import { useEditProfileMutation } from "../../services/userAuthApi";

const EditProfile = () => {
  const [serverError, setServerError] = useState({});
  const [serverMsg, setServerMsg] = useState({});
  const { email: userEmail, name: userName } = useSelector((state) => state.user);
  const { access_token } = useSelector((state) => state.auth);
  const [editProfile, { isLoading }] = useEditProfileMutation();

  useEffect(() => {
    if (access_token) {
      console.log(window.location.pathname)
      localStorage.setItem('lastLocation', window.location.pathname);
    }
  }, [access_token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      email: data.get("email"),
      name: data.get("name"),
    };

    try {
      const res = await editProfile({ actualData, access_token });
      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data);
      } else if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        // No need to dispatch here, as the Redux state will automatically be updated
      }
    } catch (error) {
      console.error(error);
      setServerError({
        non_field_errors: ["An error occurred while updating the profile."],
      });
    }
  };

  return (
    <div style={{       
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5",
    marginRight: '-108px',
    marginTop: '-17px',
    }}>
      <Box sx={{ display: "flex", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", flexDirection: "column", flexWrap: "wrap", maxWidth: 600, mx: 4, padding: '2rem', borderRadius: '0.3rem' }}>
        <div style={{ backgroundColor: '#f5f5f5', padding: '2rem', borderRadius: '0.3rem' }}>
            <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '20px' }}>ویرایش پروفایل</Typography>
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                label="ایمیل"
                defaultValue={userEmail}
                dir="ltr"
                sx={{ pb: 2 }}
              />
              {serverError.email ? (
                <Typography style={{ fontSize: 12, color: "red", paddingLeft: 10, marginTop: 5 }}>
                  {serverError.email[0]}
                </Typography>
              ) : (
                ""
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                name="name"
                label="نام"
                defaultValue={userName}
                dir="ltr"
                sx={{ pb: 2 }}
              />
              {serverError.name ? (
                <Typography style={{ fontSize: 12, color: "red", paddingLeft: 10, marginTop: 5 }}>
                  {serverError.name[0]}
                </Typography>
              ) : (
                ""
              )}
              <Box textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, mb: 2, px: 5 }}
                  disabled={isLoading}
                  style={{direction: 'rtl'}}
                >
                  {isLoading ? "در حال به روز رسانی ..." : "ویرایش پروفایل"}
                </Button>
              </Box>
              {serverError.error ? (
                <Alert severity="error" style={{ marginTop: 10, direction: 'rtl' }}>{serverError.error[0]}</Alert>
              ) : (
                ""
              )}
              {serverMsg.msg ? <Alert severity="success" style={{ marginTop: 10 , direction: 'rtl'}}>{serverMsg.msg}</Alert> : ""}
            </Box>
        </div>
      </Box>
    </div>
  );
};

export default EditProfile;