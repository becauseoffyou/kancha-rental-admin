import { useEffect, useState } from "react";
import {
    FiEye,
    FiRefreshCw,
    FiSearch,
} from "react-icons/fi";

import adminService from "../services/adminService";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
    const navigate = useNavigate();

    function PaymentBadge({ status }) {
        const configs = {
            PENDING: {
                label: "Belum Bayar",
                background: "#fef2f2",
                color: "#dc2626",
            },

            WAITING_VERIFICATION: {
                label: "Menunggu Verifikasi",
                background: "#fffbeb",
                color: "#b45309",
            },

            PARTIAL: {
                label: "DP Terbayar",
                background: "#fff7ed",
                color: "#c2410c",
            },

            PAID: {
                label: "Terbayar",
                background: "#f0fdf4",
                color: "#15803d",
            },

            REJECTED: {
                label: "Ditolak",
                background: "#fef2f2",
                color: "#dc2626",
            },
        };

        const config =
            configs[status] || {
                label: status || "-",
                bg: "#f3f4f6",
                color: "#6b7280",
            };

        return (
            <span
                style={{
                    background:
                        config.bg,
                    color:
                        config.color,
                    padding: "6px 9px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                }}
            >
                {config.label}
            </span>
        );
    }


    function RentalBadge({ status }) {
        const configs = {
            PENDING_PAYMENT: {
                label:
                    "Menunggu Pembayaran",
                bg: "#fef2f2",
                color: "#dc2626",
            },

            WAITING_CONFIRMATION: {
                label:
                    "Menunggu Konfirmasi",
                bg: "#fffbeb",
                color: "#b45309",
            },

            CONFIRMED: {
                label: "Dikonfirmasi",
                bg: "#eff6ff",
                color: "#2563eb",
            },

            READY_FOR_PICKUP: {
                label: "Siap Diambil",
                bg: "#eff6ff",
                color: "#2563eb",
            },

            RENTED: {
                label: "Sedang Disewa",
                bg: "#faf5ff",
                color: "#7e22ce",
            },

            COMPLETED: {
                label: "Selesai",
                bg: "#f0fdf4",
                color: "#15803d",
            },

            CANCELLED: {
                label: "Dibatalkan",
                bg: "#f3f4f6",
                color: "#6b7280",
            },
        };

        const config =
            configs[status] || {
                label: status || "-",
                bg: "#f3f4f6",
                color: "#6b7280",
            };

        return (
            <span
                style={{
                    background:
                        config.bg,
                    color:
                        config.color,
                    padding: "6px 9px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                }}
            >
                {config.label}
            </span>
        );
    }
    const [bookings, setBookings] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await adminService.getBookings();

            setBookings(data);

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Gagal mengambil booking"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const formatRupiah = (value) => {
        return `Rp${Number(
            value || 0
        ).toLocaleString("id-ID")}`;
    };

    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const filteredBookings =
        bookings.filter((booking) => {

            const keyword =
                search.toLowerCase();

            const matchesSearch =
                booking.order_number
                    ?.toLowerCase()
                    .includes(keyword) ||

                booking.customer_name
                    ?.toLowerCase()
                    .includes(keyword) ||

                booking.equipment_name
                    ?.toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                booking.rental_status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    return (
        <div>

            {/* HEADER */}

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Booking
                    </h1>

                    <p style={styles.subtitle}>
                        Kelola seluruh pesanan rental KANCHA
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={loadBookings}
                >
                    <FiRefreshCw />

                    Refresh
                </button>
            </div>


            {/* FILTER */}

            <div style={styles.filterBar}>

                <div style={styles.searchBox}>
                    <FiSearch
                        color="#9ca3af"
                    />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Cari order, customer, equipment..."
                        style={styles.searchInput}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    style={styles.select}
                >
                    <option value="ALL">
                        Semua Status
                    </option>

                    <option value="PENDING_PAYMENT">
                        Menunggu Pembayaran
                    </option>

                    <option value="WAITING_CONFIRMATION">
                        Menunggu Konfirmasi
                    </option>

                    <option value="CONFIRMED">
                        Dikonfirmasi
                    </option>

                    <option value="READY_FOR_PICKUP">
                        Siap Diambil
                    </option>

                    <option value="RENTED">
                        Sedang Disewa
                    </option>

                    <option value="COMPLETED">
                        Selesai
                    </option>

                    <option value="CANCELLED">
                        Dibatalkan
                    </option>
                </select>

            </div>


            {/* LOADING */}

            {loading && (
                <div style={styles.message}>
                    Memuat booking...
                </div>
            )}


            {/* ERROR */}

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}


            {/* TABLE */}

            {!loading &&
                !error &&
                filteredBookings.length >
                0 && (

                    <div
                        style={
                            styles.tableWrapper
                        }
                    >

                        <table
                            style={styles.table}
                        >

                            <thead>
                                <tr>
                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Order
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Customer
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Equipment
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Periode
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Total
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Payment
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Status Rental
                                    </th>

                                    <th
                                        style={
                                            styles.th
                                        }
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {filteredBookings.map(
                                    (booking) => (

                                        <tr
                                            key={
                                                booking.id
                                            }
                                        >

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <strong>
                                                    {
                                                        booking.order_number
                                                    }
                                                </strong>

                                                <div
                                                    style={
                                                        styles.small
                                                    }
                                                >
                                                    {formatDate(
                                                        booking.created_at
                                                    )}
                                                </div>
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    booking.customer_name
                                                }

                                                <div
                                                    style={
                                                        styles.small
                                                    }
                                                >
                                                    {
                                                        booking.customer_email
                                                    }
                                                </div>
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {
                                                    booking.equipment_name
                                                }
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                {formatDate(
                                                    booking.start_date
                                                )}

                                                <div
                                                    style={
                                                        styles.small
                                                    }
                                                >
                                                    s/d{" "}
                                                    {formatDate(
                                                        booking.end_date
                                                    )}
                                                </div>
                                            </td>


                                            <td>
                                                <div style={styles.totalAmount}>
                                                    {formatRupiah(booking.grand_total)}
                                                </div>

                                                <div
                                                    style={{
                                                        ...styles.paymentLabel,
                                                        color:
                                                            booking.payment_status === "PAID"
                                                                ? "#16a34a"
                                                                : "#9ca3af",
                                                    }}
                                                >
                                                    {booking.payment_status === "PAID"
                                                        ? "LUNAS"
                                                        : booking.payment_status === "PARTIAL"
                                                            ? "DP / BELUM LUNAS"
                                                            : booking.payment_type === "DP"
                                                                ? "DP 50%"
                                                                : "FULL"}
                                                </div>
                                            </td>

                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <PaymentBadge
                                                    status={
                                                        booking.payment_status
                                                    }
                                                />
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <RentalBadge
                                                    status={
                                                        booking.rental_status
                                                    }
                                                />
                                            </td>


                                            <td
                                                style={
                                                    styles.td
                                                }
                                            >
                                                <button
                                                    style={styles.detailButton}
                                                    onClick={() =>
                                                        navigate(
                                                            `/bookings/${booking.order_number}`
                                                        )
                                                    }
                                                >
                                                    <FiEye />
                                                    Lihat
                                                </button>
                                            </td>

                                        </tr>
                                    ))}

                            </tbody>

                        </table>

                    </div>
                )}


            {!loading &&
                !error &&
                filteredBookings.length ===
                0 && (

                    <div style={styles.empty}>
                        Tidak ada booking ditemukan.
                    </div>
                )}

        </div>
    );
}
const styles = {
    header: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
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
        display: "flex",
        alignItems: "center",
        gap: 7,
        border:
            "1px solid #d1d5db",
        background: "#fff",
        padding: "10px 14px",
        borderRadius: 9,
        cursor: "pointer",
    },

    filterBar: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
    },

    searchBox: {
        flex: 1,
        maxWidth: 420,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        border:
            "1px solid #d1d5db",
        borderRadius: 9,
        padding: "0 12px",
    },

    searchInput: {
        width: "100%",
        border: 0,
        outline: "none",
        padding: "11px 0",
        background:
            "transparent",
    },

    select: {
        border:
            "1px solid #d1d5db",
        background: "#fff",
        borderRadius: 9,
        padding: "0 12px",
        outline: "none",
    },

    tableWrapper: {
        background: "#fff",
        border:
            "1px solid #e5e7eb",
        borderRadius: 14,
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse:
            "collapse",
        minWidth: 1100,
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: 600,
        color: "#111827",
    },

    paymentLabel: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.2,
    },
    th: {
        padding: "14px 16px",
        textAlign: "left",
        color: "#6b7280",
        fontSize: 11,
        background: "#f9fafb",
        borderBottom:
            "1px solid #e5e7eb",
    },

    td: {
        padding: 16,
        fontSize: 12,
        verticalAlign: "middle",
        borderBottom:
            "1px solid #f3f4f6",
    },

    small: {
        color: "#9ca3af",
        fontSize: 10,
        marginTop: 4,
    },

    detailButton: {
        border:
            "1px solid #d1d5db",
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

    error: {
        padding: 15,
        background: "#fef2f2",
        border:
            "1px solid #fecaca",
        color: "#b91c1c",
        borderRadius: 10,
    },

    empty: {
        background: "#fff",
        border:
            "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 35,
        textAlign: "center",
        color: "#6b7280",
    },
};