import { Box, Typography } from "@mui/material";
import PageTitleProps from "./PageTitleProps";


function PageTitle({ title }: PageTitleProps) {
    
    
    return (
        <Box sx={{ paddingTop: "30px", paddingBottom: "30px", margin: "auto", textAlign: "center" }}>
            <Typography variant="h2">
                {title}
            </Typography>
        </Box>
    );
}

export default PageTitle;
