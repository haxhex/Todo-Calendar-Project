import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { unSetUserToken } from "../features/authSlice";
import { unsetUserInfo } from "../features/userSlice";
import { removeToken } from "../services/LocalStorageService";
import MenuIcon from "@mui/icons-material/Menu";
import Hidden from "@mui/material/Hidden";


const Navbar = () => {
  const { access_token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (windowSize[0] >= 750) {
      setOpenDrawer(true);
    } else {
      setOpenDrawer(false);
    }
  }, [windowSize]);


  const handleLogout = () => {
    dispatch(unsetUserInfo({ name: "", email: "" }));
    dispatch(unSetUserToken({ access_token: null }));
    removeToken();
    localStorage.removeItem("lastLocation"); // Remove last URL from localStorage
    navigate("/login");
  };

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    
    <Box>
      {/* Menu button to toggle Navbar on small screens */}
      <Hidden mdUp>
        <IconButton
          color="inherit"
          edge="end" // Place the menu icon on the right
          aria-label="menu"
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            zIndex: 2,
          }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
      </Hidden>

      {/* Desktop Navbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#9c27b0", // Change the background color to a light gray
          height: "100vh",
          position: "fixed",
          right: openDrawer ? "0" : "-250px", // Adjust the position here
          transition: "right 0.3s ease", // Transition for smooth sliding animation
          width: "250px",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: "white",
            padding: "1rem",
            borderRadius: "0.3rem",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          تقویم و لیست کارها
        </Typography>
        {/* Desktop Navbar links */}
        {access_token && (
          <>
            <Button
              component={NavLink}
              to="/dashboard"
              exact
              onClick={() =>
                localStorage.setItem("lastLocation", "/dashboard")
              }
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/dashboard" ? "#6d1b7b" : "",
              }}
            >
              داشبورد
            </Button>
            <Button
              component={NavLink}
              to="/calendar"
              exact
              onClick={() =>
                localStorage.setItem("lastLocation", "/calendar")
              }
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/calendar" ? "#6d1b7b" : "",
              }}
            >
              تقویم
            </Button>
            <Button
              component={NavLink}
              to="/tasklist"
              exact
              onClick={() =>
                localStorage.setItem("lastLocation", "/tasklist")
              }
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/tasklist" ? "#6d1b7b" : "",
              }}
            >
              لیست ها
            </Button>
            <Button
              component={NavLink}
              to="/report"
              exact
              onClick={() => localStorage.setItem("lastLocation", "/report")}
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/report" ? "#6d1b7b" : "",
              }}
            >
              گزارش ها
            </Button>
            <Button
              component={NavLink}
              to="/edit-profile"
              exact
              onClick={() =>
                localStorage.setItem("lastLocation", "/edit-profile")
              }
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/edit-profile" ? "#6d1b7b" : "",
              }}
            >
              ویرایش اطلاعات
            </Button>
            <Button
              component={NavLink}
              to="/change-password"
              exact
              onClick={() =>
                localStorage.setItem("lastLocation", "/change-password")
              }
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
                backgroundColor: location.pathname === "/change-password" ? "#6d1b7b" : "",
              }}
            >
              تغییر رمز
            </Button>
            <Button
              onClick={handleLogout}
              style={{ backgroundColor: "#43185d" }}
              sx={{
                color: "white",
                textTransform: "none",
                my: 1,
                width: "100%",
              }}
            >
              خروج
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
