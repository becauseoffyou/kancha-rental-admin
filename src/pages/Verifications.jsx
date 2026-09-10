import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:9090/api";

export default function Verifications() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPending = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/verification/admin/pending`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Gagal mengambil data verifikasi"
                );
            }

            setData(result.data || []);
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleApprove = async (userId) => {
        const confirm = await Swal.fire({
            title: "Setujui Verifikasi?",
            text: "Customer akan mendapatkan status VERIFIED.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Setujui",
            cancelButtonText: "Batal",
            confirmButtonColor: "#111827",
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/verification/admin/${userId}/approve`,
                {
                    method: "PATCH",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Gagal menyetujui verifikasi"
                );
            }

            await Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Customer berhasil diverifikasi.",
                timer: 1500,
                showConfirmButton: false,
            });

            loadPending();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.message,
            });
        }
    };

    const handleReject = async (userId) => {
        const result = await Swal.fire({
            title: "Tolak Verifikasi",
            input: "textarea",
            inputLabel: "Alasan Penolakan",
            inputPlaceholder:
                "Contoh: Foto KTP kurang jelas...",
            showCancelButton: true,
            confirmButtonText: "Tolak",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            inputValidator: (value) => {
                if (!value) {
                    return "Alasan penolakan wajib diisi";
                }
            },
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/verification/admin/${userId}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: result.value,
                    }),
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                    "Gagal menolak verifikasi"
                );
            }

            await Swal.fire({
                icon: "success",
                title: "Verifikasi Ditolak",
                timer: 1500,
                showConfirmButton: false,
            });

            loadPending();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.message,
            });
        }
    };

    if (loading) {
        return <div>Memuat data verifikasi...</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Verifikasi Customer
                    </h1>

                    <p style={styles.subtitle}>
                        Review data identitas customer
                        yang menunggu persetujuan.
                    </p>
                </div>

                <div style={styles.count}>
                    {data.length} Pending
                </div>
            </div>

            {data.length === 0 ? (
                <div style={styles.empty}>
                    Tidak ada verifikasi yang menunggu.
                </div>
            ) : (
                <div style={styles.grid}>
                    {data.map((item) => (
                        <div
                            key={item.id}
                            style={styles.card}
                        >
                            <div style={styles.customerInfo}>
                                <h3 style={styles.name}>
                                    {item.name ||
                                        item.full_name}
                                </h3>

                                <span style={styles.email}>
                                    {item.email}
                                </span>

                                <span style={styles.nik}>
                                    NIK: {item.nik}
                                </span>
                            </div>

                            <div style={styles.imageGrid}>
                                <div>
                                    <div style={styles.imageLabel}>
                                        KTP
                                    </div>

                                    <img
                                        src={item.ktp_image_url}
                                        alt="KTP"
                                        style={styles.image}
                                    />
                                </div>

                                <div>
                                    <div style={styles.imageLabel}>
                                        Selfie
                                    </div>

                                    <img
                                        src={
                                            item.selfie_image_url
                                        }
                                        alt="Selfie"
                                        style={styles.image}
                                    />
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <button
                                    type="button"
                                    style={styles.rejectButton}
                                    onClick={() =>
                                        handleReject(
                                            item.user_id
                                        )
                                    }
                                >
                                    Tolak
                                </button>

                                <button
                                    type="button"
                                    style={styles.approveButton}
                                    onClick={() =>
                                        handleApprove(
                                            item.user_id
                                        )
                                    }
                                >
                                    Setujui
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        padding: 30,
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    title: {
        margin: 0,
        fontSize: 26,
        color: "#111827",
    },

    subtitle: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: 13,
    },

    count: {
        background: "#fef3c7",
        color: "#92400e",
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(380px, 1fr))",
        gap: 20,
    },

    card: {
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        background: "#ffffff",
    },

    customerInfo: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        marginBottom: 15,
    },

    name: {
        margin: 0,
        color: "#111827",
    },

    email: {
        fontSize: 12,
        color: "#6b7280",
    },

    nik: {
        fontSize: 12,
        color: "#374151",
        fontWeight: 600,
    },

    imageGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
    },

    imageLabel: {
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 6,
        color: "#6b7280",
    },

    image: {
        width: "100%",
        height: 220,
        objectFit: "contain",
        borderRadius: 10,
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
    },

    actions: {
        display: "flex",
        gap: 10,
        marginTop: 16,
    },

    approveButton: {
        flex: 1,
        border: 0,
        padding: 12,
        borderRadius: 9,
        background: "#111827",
        color: "#ffffff",
        fontWeight: 700,
        cursor: "pointer",
    },

    rejectButton: {
        flex: 1,
        border: "1px solid #dc2626",
        padding: 12,
        borderRadius: 9,
        background: "#ffffff",
        color: "#dc2626",
        fontWeight: 700,
        cursor: "pointer",
    },

    empty: {
        padding: 30,
        textAlign: "center",
        border: "1px dashed #d1d5db",
        borderRadius: 12,
        color: "#6b7280",
    },
};