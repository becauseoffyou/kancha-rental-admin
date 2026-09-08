import {
    FiCalendar,
    FiDollarSign,
    FiCamera,
    FiUsers,
} from "react-icons/fi";

export default function Dashboard() {
    const stats = [
        {
            title: "Booking Aktif",
            value: 12,
            icon: <FiCalendar />,
        },
        {
            title: "Menunggu Verifikasi",
            value: 4,
            icon: <FiDollarSign />,
        },
        {
            title: "Equipment Tersedia",
            value: 18,
            icon: <FiCamera />,
        },
        {
            title: "Customer",
            value: 36,
            icon: <FiUsers />,
        },
    ];

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Ringkasan operasional KANCHA Rental
                    </p>
                </div>
            </div>

            <div style={styles.grid}>
                {stats.map((item) => (
                    <div
                        key={item.title}
                        style={styles.card}
                    >
                        <div style={styles.cardIcon}>
                            {item.icon}
                        </div>

                        <div>
                            <div style={styles.cardTitle}>
                                {item.title}
                            </div>

                            <div style={styles.cardValue}>
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.panel}>
                <h3>
                    Pembayaran Menunggu Verifikasi
                </h3>

                <p style={styles.empty}>
                    Data pembayaran nanti kita sambungkan
                    langsung dari backend.
                </p>
            </div>
        </div>
    );
}

const styles = {
    header: {
        marginBottom: 25,
    },

    title: {
        margin: 0,
        fontSize: 28,
    },

    subtitle: {
        marginTop: 6,
        color: "#6b7280",
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 18,
    },

    card: {
        background: "#fff",
        borderRadius: 14,
        padding: 20,
        display: "flex",
        gap: 16,
        alignItems: "center",
        border: "1px solid #e5e7eb",
    },

    cardIcon: {
        width: 45,
        height: 45,
        borderRadius: 10,
        background: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 21,
    },

    cardTitle: {
        color: "#6b7280",
        fontSize: 13,
    },

    cardValue: {
        fontSize: 24,
        fontWeight: 800,
        marginTop: 5,
    },

    panel: {
        background: "#fff",
        marginTop: 25,
        padding: 22,
        borderRadius: 14,
        border: "1px solid #e5e7eb",
    },

    empty: {
        color: "#6b7280",
    },
};