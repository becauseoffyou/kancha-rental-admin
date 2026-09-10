import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    FiEye,
    FiX,
    FiZoomIn,
    FiZoomOut,
    FiCheck,
    FiXCircle,
} from "react-icons/fi";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:9090/api";

export default function Verifications() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState(null);
    const [zoomKtp, setZoomKtp] = useState(1);
    const [zoomSelfie, setZoomSelfie] = useState(1);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewZoom, setPreviewZoom] = useState(1);

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

    const openDetail = (item) => {
        setSelected(item);
        setZoomKtp(1);
        setZoomSelfie(1);
    };

    const closeDetail = () => {
        setSelected(null);
        setZoomKtp(1);
        setZoomSelfie(1);
    };

    const handleApprove = async (userId) => {
        const confirm = await Swal.fire({
            title: "Setujui Verifikasi?",
            html: `
        <div style="
            color:#6b7280;
            font-size:14px;
            line-height:1.6;
            margin-top:6px;
        ">
            Pastikan data identitas dan foto customer
            sudah sesuai sebelum verifikasi disetujui.
        </div>
    `,
            icon: "question",

            showCancelButton: true,
            reverseButtons: true,

            confirmButtonText: "Ya, Setujui",
            cancelButtonText: "Batal",

            confirmButtonColor: "#111827",
            cancelButtonColor: "#f3f4f6",

            customClass: {
                popup: "kancha-swal",
                title: "kancha-swal-title",
                confirmButton: "kancha-confirm",
                cancelButton: "kancha-cancel",
            },

            buttonsStyling: false,
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

            closeDetail();

            await Swal.fire({
                icon: "success",
                title: "Verifikasi Berhasil",
                html: `
        <div style="
            color:#6b7280;
            font-size:14px;
            line-height:1.6;
        ">
            Customer telah berhasil diverifikasi
            dan sekarang dapat melakukan booking.
        </div>
    `,
                confirmButtonText: "Selesai",
                customClass: {
                    popup: "kancha-swal",
                    title: "kancha-swal-title",
                    confirmButton: "kancha-confirm",
                },
                buttonsStyling: false,
            });

            loadPending();
            window.dispatchEvent(
                new Event("refresh-sidebar-badges")
            );
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
                if (!value?.trim()) {
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

            const responseData =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                    "Gagal menolak verifikasi"
                );
            }

            closeDetail();

            await Swal.fire({
                icon: "success",
                title: "Verifikasi Ditolak",
                timer: 1400,
                showConfirmButton: false,
            });

            loadPending();
            window.dispatchEvent(
                new Event("refresh-sidebar-badges")
            );
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.message,
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    if (loading) {
        return (
            <div style={styles.page}>
                Memuat data verifikasi...
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Verifikasi Customer
                    </h1>

                    <p style={styles.subtitle}>
                        Customer yang menunggu
                        verifikasi identitas.
                    </p>
                </div>

                <div style={styles.count}>
                    {data.length} Pending
                </div>
            </div>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>
                                Customer
                            </th>

                            <th style={styles.th}>
                                Email
                            </th>

                            <th style={styles.th}>
                                NIK
                            </th>

                            <th style={styles.th}>
                                Status
                            </th>

                            <th style={styles.th}>
                                Tanggal Submit
                            </th>

                            <th style={styles.th}>
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    style={styles.empty}
                                >
                                    Tidak ada verifikasi
                                    yang menunggu.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id}>
                                    <td style={styles.td}>
                                        <strong>
                                            {item.user_name || item.full_name}
                                        </strong>
                                    </td>

                                    <td style={styles.td}>
                                        {item.email || "-"}
                                    </td>

                                    <td style={styles.td}>
                                        {item.nik || "-"}
                                    </td>

                                    <td style={styles.td}>
                                        <span
                                            style={
                                                styles.pendingBadge
                                            }
                                        >
                                            PENDING
                                        </span>
                                    </td>

                                    <td style={styles.td}>
                                        {formatDate(
                                            item.submitted_at
                                        )}
                                    </td>

                                    <td style={styles.td}>
                                        <button
                                            type="button"
                                            style={
                                                styles.detailButton
                                            }
                                            onClick={() =>
                                                openDetail(item)
                                            }
                                        >
                                            <FiEye />
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    Detail Verifikasi
                                </h2>

                                <span
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    Review data customer
                                    sebelum approval.
                                </span>
                            </div>

                            <button
                                type="button"
                                style={styles.closeButton}
                                onClick={closeDetail}
                            >
                                <FiX size={22} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.section}>
                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Data Register
                                </h3>

                                <div style={styles.infoGrid}>
                                    <Info
                                        label="Nama"
                                        value={
                                            selected.user_name ||
                                            "-"
                                        }
                                    />

                                    <Info
                                        label="Email"
                                        value={
                                            selected.email ||
                                            "-"
                                        }
                                    />

                                    <Info
                                        label="No. Telepon"
                                        value={
                                            selected.phone ||
                                            "-"
                                        }
                                    />

                                    <Info
                                        label="User ID"
                                        value={
                                            selected.user_id ||
                                            "-"
                                        }
                                    />
                                    <Info
                                        label="Tanggal Daftar"
                                        value={formatDate(
                                            selected.registered_at
                                        )}
                                    />
                                </div>
                            </div>

                            <div style={styles.section}>
                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Data Verifikasi
                                </h3>

                                <div style={styles.infoGrid}>
                                    <Info
                                        label="Nama Sesuai KTP"
                                        value={
                                            selected.full_name ||
                                            "-"
                                        }
                                    />

                                    <Info
                                        label="NIK"
                                        value={
                                            selected.nik ||
                                            "-"
                                        }
                                    />

                                    <Info
                                        label="Status"
                                        value={
                                            selected.verification_status ||
                                            "PENDING"
                                        }
                                    />

                                    <Info
                                        label="Tanggal Submit"
                                        value={formatDate(
                                            selected.submitted_at
                                        )}
                                    />
                                </div>
                            </div>

                            <div style={styles.documentGrid}>
                                <ImageViewer
                                    title="Foto KTP"
                                    src={selected.ktp_image_url}
                                    zoom={zoomKtp}
                                    setZoom={setZoomKtp}
                                    onPreview={(src) => {
                                        setPreviewImage(src);
                                        setPreviewZoom(1);
                                    }}
                                />

                                <ImageViewer
                                    title="Foto Selfie"
                                    src={selected.selfie_image_url}
                                    zoom={zoomSelfie}
                                    setZoom={setZoomSelfie}
                                    onPreview={(src) => {
                                        setPreviewImage(src);
                                        setPreviewZoom(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                type="button"
                                style={styles.rejectButton}
                                onClick={() =>
                                    handleReject(
                                        selected.user_id
                                    )
                                }
                            >
                                <FiXCircle />
                                Tolak
                            </button>

                            <button
                                type="button"
                                style={styles.approveButton}
                                onClick={() =>
                                    handleApprove(
                                        selected.user_id
                                    )
                                }
                            >
                                <FiCheck />
                                Setujui
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div style={styles.previewOverlay}>
                    <div style={styles.previewHeader}>
                        <div style={styles.previewTools}>
                            <button
                                style={styles.previewButton}
                                onClick={() =>
                                    setPreviewZoom((prev) =>
                                        Math.max(prev - 0.25, 0.5)
                                    )
                                }
                            >
                                <FiZoomOut />
                            </button>

                            <span style={styles.previewZoomText}>
                                {Math.round(previewZoom * 100)}%
                            </span>

                            <button
                                style={styles.previewButton}
                                onClick={() =>
                                    setPreviewZoom((prev) =>
                                        Math.min(prev + 0.25, 5)
                                    )
                                }
                            >
                                <FiZoomIn />
                            </button>

                            <button
                                style={styles.previewResetButton}
                                onClick={() =>
                                    setPreviewZoom(1)
                                }
                            >
                                Reset
                            </button>
                        </div>

                        <button
                            style={styles.previewCloseButton}
                            onClick={() => {
                                setPreviewImage(null);
                                setPreviewZoom(1);
                            }}
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div style={styles.previewBody}>
                        <img
                            src={previewImage}
                            alt="Preview dokumen"
                            style={{
                                ...styles.previewImage,
                                transform: `scale(${previewZoom})`,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
                {label}
            </span>

            <strong style={styles.infoValue}>
                {value}
            </strong>
        </div>
    );
}

function ImageViewer({
    title,
    src,
    zoom,
    setZoom,
    onPreview,
}) {
    const zoomIn = () => {
        setZoom((prev) =>
            Math.min(prev + 0.25, 3)
        );
    };

    const zoomOut = () => {
        setZoom((prev) =>
            Math.max(prev - 0.25, 0.5)
        );
    };

    return (
        <div style={styles.imageCard}>
            <div style={styles.imageHeader}>
                <strong>{title}</strong>

                <div style={styles.zoomActions}>
                    <button
                        type="button"
                        style={styles.zoomButton}
                        onClick={zoomOut}
                    >
                        <FiZoomOut />
                    </button>

                    <span style={styles.zoomText}>
                        {Math.round(zoom * 100)}%
                    </span>

                    <button
                        type="button"
                        style={styles.zoomButton}
                        onClick={zoomIn}
                    >
                        <FiZoomIn />
                    </button>
                </div>
            </div>

            <div style={styles.imageViewport}>
                {src ? (
                    <img
                        src={src}
                        alt={title}
                        onClick={() => onPreview(src)}
                        style={{
                            ...styles.documentImage,
                            transform: `scale(${zoom})`,
                            cursor: "zoom-in",
                        }}
                    />
                ) : (
                    <div style={styles.noImage}>
                        Gambar tidak tersedia
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: 30,
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },

    title: {
        margin: 0,
        fontSize: 26,
        color: "#111827",
    },

    subtitle: {
        margin: "6px 0 0",
        fontSize: 13,
        color: "#6b7280",
    },

    count: {
        padding: "8px 13px",
        background: "#fef3c7",
        color: "#92400e",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
    },

    tableCard: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        padding: "13px 16px",
        textAlign: "left",
        fontSize: 11,
        color: "#6b7280",
        background: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
    },

    td: {
        padding: "14px 16px",
        fontSize: 12,
        color: "#374151",
        borderBottom: "1px solid #f3f4f6",
    },

    pendingBadge: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 999,
        background: "#fef3c7",
        color: "#92400e",
        fontSize: 10,
        fontWeight: 700,
    },

    detailButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        padding: "7px 10px",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
    },

    empty: {
        padding: 35,
        textAlign: "center",
        color: "#6b7280",
    },

    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(17,24,39,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modal: {
        width: "100%",
        maxWidth: 1050,
        maxHeight: "92vh",
        background: "#fff",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow:
            "0 25px 60px rgba(0,0,0,.25)",
    },

    modalHeader: {
        padding: "18px 22px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    modalTitle: {
        margin: 0,
        fontSize: 20,
    },

    modalSubtitle: {
        fontSize: 12,
        color: "#6b7280",
    },

    closeButton: {
        width: 38,
        height: 38,
        border: 0,
        borderRadius: 9,
        background: "#f3f4f6",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    modalBody: {
        overflowY: "auto",
        padding: 22,
    },

    section: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 14,
        margin: "0 0 12px",
        color: "#111827",
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0,1fr))",
        gap: 12,
    },

    infoItem: {
        background: "#f9fafb",
        borderRadius: 9,
        padding: 12,
    },

    infoLabel: {
        display: "block",
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 4,
    },

    infoValue: {
        fontSize: 12,
        color: "#111827",
        wordBreak: "break-word",
    },

    documentGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
    },

    imageCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
    },

    imageHeader: {
        height: 48,
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 12,
    },

    zoomActions: {
        display: "flex",
        alignItems: "center",
        gap: 7,
    },

    zoomButton: {
        width: 30,
        height: 30,
        border: "1px solid #d1d5db",
        background: "#fff",
        borderRadius: 7,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
    },

    zoomText: {
        minWidth: 42,
        textAlign: "center",
        fontSize: 10,
        color: "#6b7280",
    },

    imageViewport: {
        height: 330,
        overflow: "auto",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    documentImage: {
        maxWidth: "90%",
        maxHeight: "90%",
        objectFit: "contain",
        transition: "transform .15s ease",
    },

    noImage: {
        fontSize: 12,
        color: "#9ca3af",
    },

    modalFooter: {
        padding: "15px 22px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },

    rejectButton: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 18px",
        borderRadius: 9,
        border: "1px solid #dc2626",
        background: "#fff",
        color: "#dc2626",
        fontWeight: 700,
        cursor: "pointer",
    },

    approveButton: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 18px",
        borderRadius: 9,
        border: 0,
        background: "#111827",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
    },
    previewOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        background: "rgba(0,0,0,.92)",
        display: "flex",
        flexDirection: "column",
    },

    previewHeader: {
        height: 64,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,.15)",
    },

    previewTools: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },

    previewButton: {
        width: 38,
        height: 38,
        border: "1px solid rgba(255,255,255,.25)",
        background: "rgba(255,255,255,.1)",
        color: "#fff",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    previewResetButton: {
        height: 38,
        padding: "0 14px",
        border: "1px solid rgba(255,255,255,.25)",
        background: "rgba(255,255,255,.1)",
        color: "#fff",
        borderRadius: 8,
        cursor: "pointer",
    },

    previewZoomText: {
        color: "#fff",
        minWidth: 48,
        textAlign: "center",
        fontSize: 12,
    },

    previewCloseButton: {
        width: 40,
        height: 40,
        border: 0,
        borderRadius: 8,
        background: "#dc2626",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    previewBody: {
        flex: 1,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },

    previewImage: {
        maxWidth: "90%",
        maxHeight: "80vh",
        objectFit: "contain",
        transition: "transform .15s ease",
    },
};