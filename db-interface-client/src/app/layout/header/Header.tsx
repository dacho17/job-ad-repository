import { AppBar, Box, Toolbar, Typography } from "@mui/material";

const headerTitle = "Job Ad DB Interface";

export default function Header() {
    return (
        <AppBar position="static">
            <Toolbar sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Box style={{flexGrow: 20, display:"flex", justifyContent:"center" }} >
                    <Typography variant="h6">
                        {headerTitle}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
