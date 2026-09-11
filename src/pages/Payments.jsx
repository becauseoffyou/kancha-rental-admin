import { useEffect, useState } from "react";
import {
    FiCheckCircle,
    FiEye,
    FiRefreshCw,
} from "react-icons/fi";

import adminService from "../services/adminService";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPayment, setSelectedPayment] =
        useState(null);

    const [processing, setProcessing] =
        useState(false);

    const [rejectReason, setRejectReason] =
        useState("");

    const [showReject, setShowReject] =
        useState(false);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await adminService.getWaitingPayments();

            setPayments(data);
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Gagal mengambil pembayaran"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const formatRupiah = (value) => {
        return `Rp${Number(value || 0).toLocaleString(
            "id-ID"
        )}`;
    };

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Pembayaran
                    </h1>

                    <p style={styles.subtitle}>
                        Verifikasi pembayaran customer KANCHA Rental
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={loadPayments}
                >
                    <FiRefreshCw />
                    Refresh
                </button>
            </div>

            <div style={styles.summary}>
                <div>
                    <div style={styles.summaryLabel}>
                        Menunggu Verifikasi
                    </div>

                    <div style={styles.summaryValue}>
                        {payments.length}
                    </div>
                </div>

                <FiCheckCircle
                    size={28}
                    color="#d97706"
                />
            </div>

            {loading && (
                <div style={styles.message}>
                    Memuat pembayaran...
                </div>
            )}

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                payments.length === 0 && (
                    <div style={styles.empty}>
                        Tidak ada pembayaran yang menunggu verifikasi.
                    </div>
                )}

            {!loading &&
                !error &&
                payments.length > 0 && (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>
                                        Order
                                    </th>

                                    <th style={styles.th}>
                                        Customer
                                    </th>

                                    <th style={styles.th}>
                                        Equipment
                                    </th>

                                    <th style={styles.th}>
                                        Pembayaran
                                    </th>

                                    <th style={styles.th}>
                                        Nominal
                                    </th>

                                    <th style={styles.th}>
                                        Status
                                    </th>

                                    <th style={styles.th}>
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {payments.map(
                                    (payment) => (
                                        <tr
                                            key={
                                                payment.id
                                            }
                                        >
                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        payment.order_number
                                                    }
                                                </strong>

                                                <div
                                                    style={
                                                        styles.reference
                                                    }
                                                >
                                                    {
                                                        payment.payment_reference
                                                    }
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    payment.customer_name
                                                }

                                                <div
                                                    style={
                                                        styles.reference
                                                    }
                                                >
                                                    {
                                                        payment.customer_email
                                                    }
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    payment.equipment_name
                                                }
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        payment.payment_type
                                                    }
                                                </strong>

                                                <div
                                                    style={
                                                        styles.reference
                                                    }
                                                >
                                                    {
                                                        payment.payment_method
                                                    }
                                                    {payment.bank_code
                                                        ? ` • ${payment.bank_code}`
                                                        : ""}
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {formatRupiah(
                                                        payment.amount
                                                    )}
                                                </strong>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    {payment.payment_status === "REJECTED" && (
                                                        <span style={styles.rejectedStamp}>
                                                            REJECTED
                                                        </span>
                                                    )}

                                                    <span
                                                        style={
                                                            payment.payment_status === "REJECTED"
                                                                ? styles.statusRejected
                                                                : styles.status
                                                        }
                                                    >
                                                        {payment.payment_status === "REJECTED"
                                                            ? "Ditolak"
                                                            : "Menunggu Verifikasi"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <button
                                                    style={styles.detailButton}
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowReject(false);
                                                        setRejectReason("");
                                                    }}
                                                >
                                                    <FiEye />
                                                    Lihat
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            {selectedPayment && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={styles.modalTitle}>
                                    Detail Pembayaran
                                </h2>

                                <div style={styles.reference}>
                                    {selectedPayment.payment_reference}
                                </div>
                            </div>

                            <button
                                style={styles.closeButton}
                                onClick={() =>
                                    setSelectedPayment(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.detailGrid}>
                            <Detail
                                label="Order"
                                value={
                                    selectedPayment.order_number
                                }
                            />

                            <Detail
                                label="Customer"
                                value={
                                    selectedPayment.customer_name
                                }
                            />

                            <Detail
                                label="Equipment"
                                value={
                                    selectedPayment.equipment_name
                                }
                            />

                            <Detail
                                label="Tipe Pembayaran"
                                value={
                                    selectedPayment.payment_type === "DP"
                                        ? "DP 50%"
                                        : "Pelunasan"
                                }
                            />

                            <Detail
                                label="Nominal"
                                value={formatRupiah(
                                    selectedPayment.amount
                                )}
                            />

                            <Detail
                                label="Metode"
                                value={
                                    selectedPayment.payment_method ===
                                        "TRANSFER"
                                        ? `Transfer ${selectedPayment.bank_code ||
                                        ""
                                        }`
                                        : selectedPayment.payment_method
                                }
                            />
                        </div>

                        <div style={styles.proofSection}>
                            <div style={styles.proofLabel}>
                                BUKTI TRANSFER
                            </div>

                            {selectedPayment.proof_url ? (
                                <img
                                    src={`http://kancha-rental-api-production.up.railway.app${selectedPayment.proof_url}`}
                                    alt="Bukti transfer"
                                    style={styles.proofImage}
                                />
                            ) : (
                                <div style={styles.noProof}>
                                    Bukti transfer tidak tersedia
                                </div>
                            )}
                        </div>

                        {showReject && (
                            <div style={styles.rejectBox}>
                                <label style={styles.rejectLabel}>
                                    Alasan Penolakan
                                </label>

                                <textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: Nominal transfer tidak sesuai..."
                                    style={styles.textarea}
                                />
                            </div>
                        )}

                        <div style={styles.modalActions}>
                            {!showReject ? (
                                <button
                                    style={styles.rejectButton}
                                    disabled={processing}
                                    onClick={() =>
                                        setShowReject(true)
                                    }
                                >
                                    Tolak
                                </button>
                            ) : (
                                <button
                                    style={styles.rejectButton}
                                    disabled={
                                        processing ||
                                        !rejectReason.trim()
                                    }
                                    onClick={async () => {
                                        try {
                                            setProcessing(true);

                                            await adminService.rejectPayment(
                                                selectedPayment.payment_reference,
                                                rejectReason
                                            );

                                            setSelectedPayment(null);
                                            setShowReject(false);
                                            setRejectReason("");

                                            await loadPayments();
                                        } catch (error) {
                                            alert(error.message);
                                        } finally {
                                            setProcessing(false);
                                        }
                                    }}
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Konfirmasi Tolak"}
                                </button>
                            )}

                            <button
                                style={styles.approveButton}
                                disabled={processing}
                                onClick={async () => {
                                    const confirmed =
                                        window.confirm(
                                            "Verifikasi pembayaran ini?"
                                        );

                                    if (!confirmed) return;

                                    try {
                                        setProcessing(true);

                                        await adminService.approvePayment(
                                            selectedPayment.payment_reference
                                        );

                                        setSelectedPayment(null);
                                        window.dispatchEvent(
                                            new Event("refresh-sidebar-badges")
                                        );
                                        await loadPayments();
                                    } catch (error) {
                                        alert(error.message);
                                    } finally {
                                        setProcessing(false);
                                    }
                                }}
                            >
                                {processing
                                    ? "Memproses..."
                                    : "✓ Verifikasi Pembayaran"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
function Detail({ label, value }) {
    return (
        <div>
            <div style={{
                fontSize: 11,
                color: "#9ca3af",
                marginBottom: 5,
            }}>
                {label}
            </div>

            <div style={{
                fontSize: 13,
                fontWeight: 600,
            }}>
                {value || "-"}
            </div>
        </div>
    );
}
const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        marginBottom: 22,
    },

    title: {
        margin: 0,
        fontSize: 28,
    },

    subtitle: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: 14,
    },

    refreshButton: {
        border: "1px solid #d1d5db",
        background: "#fff",
        padding: "10px 14px",
        borderRadius: 9,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 7,
    },

    summary: {
        width: 260,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
    },

    summaryLabel: {
        color: "#6b7280",
        fontSize: 12,
    },

    summaryValue: {
        fontSize: 26,
        fontWeight: 800,
        marginTop: 4,
    },

    tableWrapper: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 900,
    },

    th: {
        padding: "14px 16px",
        textAlign: "left",
        color: "#6b7280",
        fontSize: 11,
        borderBottom: "1px solid #e5e7eb",
        background: "#f9fafb",
    },

    td: {
        padding: "16px",
        borderBottom: "1px solid #f3f4f6",
        fontSize: 13,
        verticalAlign: "middle",
    },

    reference: {
        color: "#9ca3af",
        fontSize: 10,
        marginTop: 4,
    },

    status: {
        background: "#fffbeb",
        color: "#b45309",
        padding: "6px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
    },

    detailButton: {
        border: "1px solid #d1d5db",
        background: "#fff",
        borderRadius: 8,
        padding: "8px 11px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
    },

    message: {
        padding: 30,
        textAlign: "center",
        color: "#6b7280",
    },

    empty: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: 35,
        borderRadius: 14,
        textAlign: "center",
        color: "#6b7280",
    },

    error: {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        padding: 15,
        borderRadius: 10,
    },
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
    },

    modal: {
        width: "100%",
        maxWidth: 650,
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    },

    modalHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    modalTitle: {
        margin: 0,
        fontSize: 20,
    },

    closeButton: {
        border: 0,
        background: "#f3f4f6",
        width: 32,
        height: 32,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 20,
    },

    detailGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: 20,
    },

    proofSection: {
        marginTop: 25,
    },

    proofLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        marginBottom: 10,
    },

    proofImage: {
        width: "100%",
        maxHeight: 350,
        objectFit: "contain",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
    },

    noProof: {
        padding: 25,
        background: "#f9fafb",
        textAlign: "center",
        color: "#9ca3af",
        borderRadius: 10,
    },

    rejectBox: {
        marginTop: 20,
    },

    rejectLabel: {
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 8,
    },

    textarea: {
        width: "100%",
        minHeight: 90,
        resize: "vertical",
        padding: 12,
        border: "1px solid #d1d5db",
        borderRadius: 10,
        outline: "none",
    },

    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 25,
        paddingTop: 20,
        borderTop: "1px solid #e5e7eb",
    },

    rejectButton: {
        border: "1px solid #fecaca",
        background: "#fff",
        color: "#dc2626",
        padding: "11px 16px",
        borderRadius: 9,
        cursor: "pointer",
        fontWeight: 600,
    },

    approveButton: {
        border: 0,
        background: "#111827",
        color: "#fff",
        padding: "11px 18px",
        borderRadius: 9,
        cursor: "pointer",
        fontWeight: 700,
    },
    rejectedStamp: {
        display: "inline-block",
        color: "#dc2626",
        border: "2px solid #dc2626",
        borderRadius: 4,
        padding: "3px 6px",
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: 1,
        transform: "rotate(-8deg)",
        opacity: 0.8,
        whiteSpace: "nowrap",
    },

    statusRejected: {
        background: "#fef2f2",
        color: "#dc2626",
        padding: "6px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
    },
};