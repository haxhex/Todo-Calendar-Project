import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../services/userAuthApi";
import { useDispatch } from "react-redux";
import { getToken, storeToken } from "../../services/LocalStorageService";
import { setUserToken } from "../../features/authSlice";

const UserLogin = () => {
  const [server_error, setServerError] = useState({});
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      email: data.get('email'),
      password: data.get('password'),
    };
    const res = await loginUser(actualData);

    if (res.error) {
      setServerError(res.error.data);
    }
    if (res.data) {
      storeToken(res.data.token);
      let { access_token } = getToken();
      dispatch(setUserToken({ access_token: access_token }));
      navigate('/dashboard');
    }
  };

  let { access_token } = getToken();
  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);

  return (
    <div dir="rtl">
      <Box
        component='form'
        noValidate
        sx={{ mt: 1 }}
        id='login-form'
        onSubmit={handleSubmit}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id='email'
          name='email'
          label='ایمیل'
          dir='ltr'
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id='password'
          name='password'
          label='رمز عبور'
          type="password"
          dir='ltr'
        />
        <Box textAlign='center'>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2, px: 5 }}
            >
              ورود
            </Button>
          )}
        </Box>
        <NavLink to='/sendpasswordresetemail' style={{ textDecoration: 'none' }}>
          رمز عبور خود را فراموش کرده اید؟
        </NavLink>
        {server_error.errors && (
            <Alert severity="error" style={{ marginTop: 10, direction: 'rtl' }}>{server_error.errors.non_field_errors[0]}</Alert>
        )}
      </Box>
    </div>
  );
};

export default UserLogin;
