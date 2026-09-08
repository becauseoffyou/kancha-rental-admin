import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
    return (
        <div>
            <Sidebar />

            <main style={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}

const styles = {
    content: {
        marginLeft: 240,
        padding: 30,
        minHeight: "100vh",
    },
};