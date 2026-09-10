import { NavLink } from "react-router-dom";
import kanchaLogo from "../assets/logokancha.png";
import {
    FiHome,
    FiCalendar,
    FiDollarSign,
    FiCamera,
    FiUsers,
    FiBarChart2,
    FiUserCheck,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import adminService from "../services/adminService";

export default function Sidebar() {

    const [waitingPaymentCount, setWaitingPaymentCount] = useState(0);
    const [bookingPreparationCount, setBookingPreparationCount] = useState(0);

    const refreshSidebarBadges = async () => {
        try {
            const [
                waitingPayments,
                preparationCount,
            ] = await Promise.all([
                adminService.getWaitingPayments(),
                adminService.getPreparationBookingCount(),
            ]);

            setWaitingPaymentCount(
                waitingPayments.length
            );

            setBookingPreparationCount(
                preparationCount
            );

        } catch (error) {
            console.error(
                "Refresh sidebar badge error:",
                error
            );
        }
    };

    useEffect(() => {
        refreshSidebarBadges();

        const handleRefresh = () => {
            refreshSidebarBadges();
        };

        window.addEventListener(
            "refresh-sidebar-badges",
            handleRefresh
        );

        return () => {
            window.removeEventListener(
                "refresh-sidebar-badges",
                handleRefresh
            );
        };
    }, []);

    const menus = [
        {
            name: "Dashboard",
            path: "/",
            icon: <FiHome />,
        },
        {
            name: "Booking",
            path: "/bookings",
            icon: <FiCalendar />,
            badge: bookingPreparationCount,
        },
        {
            name: "Pembayaran",
            path: "/payments",
            icon: <FiDollarSign />,
            badge: waitingPaymentCount,
        },
        {
            name: "Equipment",
            path: "/equipment",
            icon: <FiCamera />,
        },
        {
            name: "Customer",
            path: "/customers",
            icon: <FiUsers />,
        },
        {
            name: "Verifikasi",
            path: "/verifications",
            icon: <FiUserCheck />,
        },
        {
            name: "Laporan",
            path: "/reports",
            icon: <FiBarChart2 />,
        },

    ];

    return (
        <aside style={styles.sidebar}>
            <div style={styles.brand}>
                <img
                    src={kanchaLogo}
                    alt="KANCHA Creative Ecosystem"
                    style={styles.brandLogo}
                />

                <div style={styles.subtitle}>
                    Admin Rental
                </div>
            </div>

            <nav style={styles.menu}>
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        end={menu.path === "/"}
                        style={({ isActive }) => ({
                            ...styles.menuItem,
                            ...(isActive ? styles.menuActive : {}),
                        })}
                    >
                        <div style={styles.menuLeft}>
                            <span style={styles.icon}>
                                {menu.icon}
                            </span>

                            <span>{menu.name}</span>
                        </div>

                        {menu.badge > 0 && (
                            <span style={styles.badge}>
                                {menu.badge > 99 ? "99+" : menu.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: 240,
        minHeight: "100vh",

        background: "#ffffff",
        color: "#111827",

        position: "fixed",
        left: 0,
        top: 0,

        padding: 20,

        borderRight: "1px solid #e5e7eb",
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.03)",

        zIndex: 100,
    },
    brand: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 35,
    },

    brandLogo: {
        width: 145,
        height: 50,
        objectFit: "contain",
    },

    subtitle: {
        width: "100%",
        textAlign: "center",
        marginTop: -4,
        color: "#454343",
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: 0.5,
    },


    menu: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },

    menuItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: "12px 14px",
        borderRadius: 10,

        color: "#6b7280",
        fontSize: 14,
    },
    menuActive: {
        background: "#f3f4f6",
        color: "#111827",
        fontWeight: 700,
    },
    icon: {
        display: "flex",
        fontSize: 18,
    },
    menuLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },

    badge: {
        minWidth: 21,
        height: 21,
        padding: "0 6px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: "#dc2626",
        color: "#ffffff",

        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
    },
};