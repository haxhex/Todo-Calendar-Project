import { Grid, Card, Tabs, Tab, Box } from "@mui/material"
import UserLogin from "./UserLogin"
import Registration from "./Registration"
import Pic1 from '../../images/Pic1.jpg'
import { useState } from "react"

const TabPanel = (props) => {
    const {children, value, index} = props
    return (
        <div role="tabpanel" hidden={value !== index}>
            {
                value === index && (
                    <Box>{children}</Box>
                )
            }
        </div>
    )
}
const LoginReg = () => {
    const [value, setValue] = useState(0)
    const handleChange = (event, newValue) => {
        setValue(newValue)
        // console.log(newValue)
    }
  return (
    <>
    <Grid container sx={{height: '90vh'}}>
        <Grid item lg={7} sm={5} sx={{
            backgroundImage: `url(${Pic1})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: {xs: 'none', sm: 'block'}
        }}>
        </Grid>
        <Grid item lg={5} sm={7} xs={12}>
            <Card sx={{width: '100%', height: '100%'}}>
                <Box sx={{mx: 5, height: 530}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={value} textColor="secondary" indicatorColor="secondary" onChange={handleChange}>
                           <Tab label='ورود' sx={{textTransform: 'none', fontWeight: 'bold'}}></Tab>
                           <Tab label='ثبت نام' sx={{textTransform: 'none', fontWeight: 'bold'}}></Tab> 
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                        <UserLogin />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Registration />
                    </TabPanel>
                </Box>
                <Box textAlign='center' sx={{mt: 2}}>
                </Box>
            </Card>
        </Grid>
    </Grid>
    </>
  )
}

export default LoginReg