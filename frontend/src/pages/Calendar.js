import React, { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import { getToken } from "../services/LocalStorageService";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../features/userSlice";
import { useGetLoggedUserQuery } from "../services/userAuthApi";
import MyCalendar from "../components/MyCalendar"; 


const Calendar = () => {
  const dispatch = useDispatch();
  const { access_token } = getToken();
  console.log(`Access Token Calendar: ${access_token}`)

  const { data, isSuccess } = useGetLoggedUserQuery(access_token);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
  });

  useEffect(() => {
    if (data && isSuccess) {
    console.log(`UserId: ${data.id}`)
      setUserData({
        email: data.email,
        name: data.name,
      });
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (data && isSuccess) {
      dispatch(
        setUserInfo({
          email: data.email,
          name: data.name,
        })
      );
    }
  }, [data, isSuccess, dispatch]);

  useEffect(() => {
    if (access_token) {
      console.log(window.location.pathname)
      localStorage.setItem('lastLocation', window.location.pathname);
    }
  }, [access_token]);


  return (
    <>
      <CssBaseline />
      <div
        style={{
          padding: "2rem",
          height: "100vh",
        }}
      >
        <h1 dir="rtl" style={{textAlign: 'center', marginBottom: '30px'}}>تقویم</h1>
        {isSuccess && userData ? (
          <>
            {/* <Typography variant="h5">Email: {userData.email}</Typography> */}
            {/* <Typography variant="h6">Name: {userData.name}</Typography> */}
            <div dir="rtl">
            <MyCalendar />
            </div>
          </>
        ) : (
          <div dir="rtl">در حال بارگذاری ... </div> // Display a loading indicator
        )}
      </div>
    </>
  );
};

export default Calendar;
