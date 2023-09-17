import { CssBaseline, Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import '../index.css'
const Layout = () => {
  return (
    <>
      <CssBaseline />
      <div style={{ 
        position: "fixed", 
        top: 0, 
        right: 0, 
        display: "flex", 
        justifyContent: "flex-end", 
        width: "100%", 
        zIndex: 9999 
      }}>
        <Navbar />
      </div>
      <div style={{ paddingTop: "1rem", minHeight: "100vh", backgroundColor: 'rgb(245, 245, 245)' }}>
        <Grid container>
          <Grid item sm={10} style={{ }}>
            <Outlet />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Layout;
