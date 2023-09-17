import React, { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import { getToken } from "../services/LocalStorageService";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../features/userSlice";
import { useGetLoggedUserQuery } from "../services/userAuthApi";
import ATaskList from "../components/ATaskList"; 
import { useParams } from "react-router-dom";

const TaskListPage = () => {
  const dispatch = useDispatch();
  const { access_token } = getToken();
  console.log(`Access Token Dash: ${access_token}`)
  const { id } = useParams();
  const { listname } = useParams();

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
          padding: "1rem",
          height: "100vh",
        }}
      >
        <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginRight: '40px',
            marginBottom: '-7px',
            direction: 'rtl'
        }}>
        <h1 dir="rtl">{listname} </h1>
        </div>
        {isSuccess && userData ? (
          <>
            {/* <Typography variant="h5">Email: {userData.email}</Typography> */}
            {/* <Typography variant="h6">Name: {userData.name}</Typography> */}
            <div dir="rtl">
            <ATaskList userId={data.id} taskListId={id} taskListName={listname} />
            </div>
          </>
        ) : (
          <div>Loading...</div> // Display a loading indicator
        )}
      </div>
    </>
  );
};

export default TaskListPage;
