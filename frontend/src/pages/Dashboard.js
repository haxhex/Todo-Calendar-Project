import React, { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import { getToken } from "../services/LocalStorageService";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../features/userSlice";
import { useGetLoggedUserQuery } from "../services/userAuthApi";
import Task from "../components/Task"; 

const Dashboard = () => {
  const dispatch = useDispatch();
  const { access_token } = getToken();
  console.log(`Access Token Dash: ${access_token}`)

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
      localStorage.setItem('lastLocation', window.location.pathname);
    }
  }, [access_token]);

  return (
    <>
      <CssBaseline />
      <div
        style={{
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        {isSuccess && userData ? (
          <>
            <div dir="rtl">
            <Task userId={data.id} />
            </div>
          </>
        ) : (
          <div dir="rtl">در حال بارگذاری ...</div> // Display a loading indicator
        )}
      </div>
    </>
  );
};

export default Dashboard;
