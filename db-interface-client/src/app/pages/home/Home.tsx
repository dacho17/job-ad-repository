import { Box } from "@mui/material";
import PageTitle from "../../components/pageTitle/PageTitle";

const HOME_PAGE_TITLE = "Home Page";

export default function HomePage() {
    return (
        <Box sx={{ width: "75%", margin: "auto" }}>
            <PageTitle title={HOME_PAGE_TITLE} />
        </Box>
    );
}
