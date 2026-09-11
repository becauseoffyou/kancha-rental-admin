import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FiArrowLeft,
    FiCheckCircle,
} from "react-icons/fi";

import adminService from "../services/adminService";

export default function BookingDetail() {
    const { orderNumber } = useParams();

    const navigate = useNavigate();

    const [booking, setBooking] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [processing, setProcessing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [assignments, setAssignments] =
        useState({});


    const loadBooking = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await adminService.getBookingDetail(
                    orderNumber
                );

            setBooking(data);

            // Load assignment yang sudah ada
            const initial = {};

            data.items.forEach((item) => {
                initial[item.id] =
                    item.assigned_units.map(
                        (unit) =>
                            String(unit.id)
                    );
            });

            setAssignments(initial);

        } catch (error) {
            setError(error.message);

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadBooking();
    }, [orderNumber]);


    const formatRupiah = (value) =>
        `Rp${Number(
            value || 0
        ).toLocaleString("id-ID")}`;


    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(
            value
        ).toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };


    const toggleUnit = (
        item,
        unitId
    ) => {
        if (
            booking.rental_status !==
            "WAITING_CONFIRMATION"
        ) {
            return;
        }

        const id =
            String(unitId);

        const current =
            assignments[item.id] || [];

        if (current.includes(id)) {
            setAssignments({
                ...assignments,

                [item.id]:
                    current.filter(
                        (value) =>
                            value !== id
                    ),
            });

            return;
        }

        if (
            current.length >=
            Number(item.quantity)
        ) {
            alert(
                `Maksimal pilih ${item.quantity} unit`
            );

            return;
        }

        setAssignments({
            ...assignments,

            [item.id]: [
                ...current,
                id,
            ],
        });
    };


    const handleConfirm = async () => {
        // Validasi frontend
        for (const item of booking.items) {
            const selected =
                assignments[item.id] ||
                [];

            if (
                selected.length !==
                Number(item.quantity)
            ) {
                alert(
                    `Pilih ${item.quantity} unit untuk ${item.equipment_name}`
                );

                return;
            }
        }

        const confirmed =
            window.confirm(
                "Konfirmasi booking dan assign unit yang dipilih?"
            );

        if (!confirmed) return;

        try {
            setProcessing(true);

            const payload =
                booking.items.map(
                    (item) => ({
                        booking_item_id:
                            item.id,

                        equipment_unit_ids:
                            (
                                assignments[
                                item.id
                                ] || []
                            ).map(Number),
                    })
                );

            await adminService.confirmBooking(
                orderNumber,
                payload
            );

            alert(
                "Booking berhasil dikonfirmasi"
            );
            window.dispatchEvent(
                new Event("refresh-sidebar-badges")
            );
            await loadBooking();

        } catch (error) {
            alert(error.message);

        } finally {
            setProcessing(false);
        }
    };

    const handleReady = async () => {
        if (
            !window.confirm(
                "Tandai equipment siap diambil customer?"
            )
        ) {
            return;
        }

        try {
            setProcessing(true);

            await adminService.markReadyForPickup(
                orderNumber
            );
            window.dispatchEvent(
                new Event("refresh-sidebar-badges")
            );
            await loadBooking();

        } catch (error) {
            alert(error.message);

        } finally {
            setProcessing(false);
        }
    };
    const handleRemainingPayment =
        async () => {
            const confirmed =
                window.confirm(
                    `Catat pelunasan sebesar ${formatRupiah(
                        remainingPayment
                    )}?`
                );

            if (!confirmed) return;

            try {
                setProcessing(true);

                await adminService.payRemaining(
                    orderNumber,
                    {
                        payment_method:
                            "CASH",
                    }
                );

                alert(
                    "Pelunasan berhasil dicatat"
                );

                await loadBooking();

            } catch (error) {
                alert(error.message);

            } finally {
                setProcessing(false);
            }
        };
    const handleHandover =
        async () => {
            if (
                !window.confirm(
                    "Equipment sudah diserahkan kepada customer?"
                )
            ) {
                return;
            }

            try {
                setProcessing(true);

                await adminService.handoverBooking(
                    orderNumber
                );

                alert(
                    "Equipment berhasil diserahkan"
                );

                await loadBooking();

            } catch (error) {
                alert(error.message);

            } finally {
                setProcessing(false);
            }
        };

    if (loading) {
        return (
            <div style={styles.message}>
                Memuat detail booking...
            </div>
        );
    }


    if (error) {
        return (
            <div style={styles.error}>
                {error}
            </div>
        );
    }


    if (!booking) return null;
    const totalPaid = (booking.payments || [])
        .filter((payment) => payment.payment_status === "PAID")
        .reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );

    const isFullyPaid =
        totalPaid >= Number(booking.grand_total || 0);

    const paymentStatusText = isFullyPaid
        ? "LUNAS"
        : totalPaid > 0
            ? "DP / BELUM LUNAS"
            : "BELUM BAYAR";

    const remainingPayment =
        Math.max(
            Number(booking.grand_total || 0) - totalPaid,
            0
        );

    return (
        <div>

            {/* BACK */}

            <button
                style={styles.back}
                onClick={() =>
                    navigate("/bookings")
                }
            >
                <FiArrowLeft />
                Kembali
            </button>


            {/* HEADER */}

            <div style={styles.header}>

                <div>
                    <div style={styles.label}>
                        BOOKING
                    </div>

                    <h1 style={styles.title}>
                        {booking.order_number}
                    </h1>

                    <div
                        style={
                            styles.created
                        }
                    >
                        Dibuat{" "}
                        {formatDate(
                            booking.created_at
                        )}
                    </div>
                </div>

                <RentalStatus
                    status={
                        booking.rental_status
                    }
                />

            </div>


            {/* INFO */}

            <div style={styles.grid}>

                <Card title="Customer">
                    <Info
                        label="Nama"
                        value={
                            booking.customer_name
                        }
                    />

                    <Info
                        label="Email"
                        value={
                            booking.customer_email
                        }
                    />

                    <Info
                        label="Telepon"
                        value={
                            booking.customer_phone
                        }
                    />

                    <Info
                        label="KYC"
                        value={
                            booking.verification_status
                        }
                    />
                </Card>


                <Card title="Durasi Sewa">
                    <Info
                        label="Mulai"
                        value={formatDate(
                            booking.start_date
                        )}
                    />

                    <Info
                        label="Selesai"
                        value={formatDate(
                            booking.end_date
                        )}
                    />

                    <Info
                        label="Pengambilan"
                        value={
                            booking.pickup_method
                        }
                    />

                    {booking.pickup_method === "DELIVERY" && (
                        <>
                            <Info
                                label="Alamat"
                                value={booking.delivery_address}
                            />

                            <Info
                                label="Jarak"
                                value={`${Number(
                                    booking.delivery_distance_km || 0
                                ).toFixed(2)} km`}
                            />

                            <Info
                                label="Biaya Delivery"
                                value={formatRupiah(
                                    booking.delivery_fee
                                )}
                            />
                        </>
                    )}
                </Card>


                <Card title="Pembayaran">
                    <Info
                        label="Total Rental"
                        value={formatRupiah(
                            booking.grand_total
                        )}
                    />

                    <Info
                        label="Tipe Awal"
                        value={
                            booking.payment_type === "DP"
                                ? "DP 50%"
                                : "FULL"
                        }
                    />

                    <Info
                        label="Status"
                        value={paymentStatusText}
                    />

                    <Info
                        label="Total Dibayar"
                        value={formatRupiah(totalPaid)}
                    />

                    {remainingPayment > 0 && (
                        <Info
                            label="Sisa"
                            value={formatRupiah(
                                remainingPayment
                            )}
                        />
                    )}
                </Card>

            </div>

            {remainingPayment > 0 && (
                <div style={styles.paymentWarning}>
                    <div style={styles.warningIcon}>
                        !
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={styles.warningTitle}>
                            Pelunasan Pembayaran Saat Pickup
                        </div>

                        <div style={styles.warningText}>
                            Customer masih memiliki sisa pembayaran sebesar{" "}
                            <strong>
                                {formatRupiah(remainingPayment)}
                            </strong>
                            . Pastikan pembayaran dilunasi sebelum equipment
                            diserahkan kepada customer.
                        </div>
                    </div>

                    <div style={styles.remainingBox}>
                        <span style={styles.remainingLabel}>
                            Sisa Pembayaran
                        </span>

                        <strong style={styles.remainingAmount}>
                            {formatRupiah(remainingPayment)}
                        </strong>
                    </div>
                </div>
            )}
            {/* EQUIPMENT */}

            <div style={styles.section}>

                <h2 style={styles.sectionTitle}>
                    Equipment & Unit
                </h2>

                {booking.items.map(
                    (item) => (

                        <div
                            key={item.id}
                            style={
                                styles.equipmentCard
                            }
                        >

                            <div
                                style={
                                    styles.equipmentHeader
                                }
                            >
                                <div>
                                    <strong>
                                        {
                                            item.equipment_name
                                        }
                                    </strong>

                                    <div
                                        style={
                                            styles.muted
                                        }
                                    >
                                        Qty{" "}
                                        {
                                            item.quantity
                                        }{" "}
                                        ×{" "}
                                        {formatRupiah(
                                            item.price_per_day
                                        )}
                                        /hari
                                    </div>
                                </div>

                                <strong>
                                    {formatRupiah(
                                        item.subtotal
                                    )}
                                </strong>
                            </div>


                            <div
                                style={
                                    styles.unitTitle
                                }
                            >
                                Pilih Unit Fisik
                            </div>


                            <div
                                style={
                                    styles.units
                                }
                            >

                                {item.available_units
                                    .length ===
                                    0 ? (

                                    <div
                                        style={
                                            styles.noUnit
                                        }
                                    >
                                        Tidak ada unit tersedia.
                                    </div>

                                ) : (

                                    item.available_units.map(
                                        (unit) => {

                                            const selected =
                                                (
                                                    assignments[
                                                    item.id
                                                    ] ||
                                                    []
                                                ).includes(
                                                    String(
                                                        unit.id
                                                    )
                                                );

                                            return (
                                                <button
                                                    key={
                                                        unit.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        toggleUnit(
                                                            item,
                                                            unit.id
                                                        )
                                                    }
                                                    style={{
                                                        ...styles.unit,

                                                        ...(selected
                                                            ? styles.unitSelected
                                                            : {}),
                                                    }}
                                                >

                                                    <div
                                                        style={
                                                            styles.unitCheck
                                                        }
                                                    >
                                                        {selected &&
                                                            "✓"}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                unit.unit_code
                                                            }
                                                        </strong>

                                                        <div
                                                            style={
                                                                styles.muted
                                                            }
                                                        >
                                                            Kondisi:{" "}
                                                            {
                                                                unit.condition
                                                            }
                                                        </div>
                                                    </div>

                                                </button>
                                            );
                                        })
                                )}

                            </div>

                        </div>
                    ))}

            </div>


            {/* ACTION */}

            {booking.rental_status ===
                "WAITING_CONFIRMATION" && (

                    <div style={styles.actionBar}>

                        <div>
                            <strong>
                                Konfirmasi Booking
                            </strong>

                            <div
                                style={
                                    styles.muted
                                }
                            >
                                Pastikan unit fisik
                                sudah dipilih sesuai
                                jumlah equipment.
                            </div>
                        </div>

                        <button
                            style={
                                styles.confirmButton
                            }
                            disabled={processing}
                            onClick={
                                handleConfirm
                            }
                        >
                            <FiCheckCircle />

                            {processing
                                ? "Memproses..."
                                : "Konfirmasi Booking"}
                        </button>

                    </div>
                )}

            {booking.rental_status ===
                "CONFIRMED" && (
                    <div style={styles.actionBar}>
                        <div>
                            <strong>
                                Persiapan Equipment
                            </strong>

                            <div style={styles.muted}>
                                Tandai jika seluruh equipment
                                sudah siap untuk diambil.
                            </div>
                        </div>

                        <button
                            style={styles.confirmButton}
                            onClick={handleReady}
                            disabled={processing}
                        >
                            Siap Diambil
                        </button>
                    </div>
                )}

            {booking.rental_status ===
                "READY_FOR_PICKUP" && (
                    <div style={styles.actionBar}>
                        <div>
                            <strong>
                                Pickup Customer
                            </strong>

                            <div style={styles.muted}>
                                {remainingPayment > 0
                                    ? `Masih ada sisa ${formatRupiah(
                                        remainingPayment
                                    )}`
                                    : "Pembayaran sudah lunas"}
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                            }}
                        >
                            {remainingPayment > 0 && (
                                <button
                                    style={
                                        styles.payButton
                                    }
                                    onClick={
                                        handleRemainingPayment
                                    }
                                    disabled={
                                        processing
                                    }
                                >
                                    Lunasi{" "}
                                    {formatRupiah(
                                        remainingPayment
                                    )}
                                </button>
                            )}

                            <button
                                style={{
                                    ...styles.confirmButton,
                                    opacity:
                                        remainingPayment >
                                            0
                                            ? 0.45
                                            : 1,
                                }}
                                disabled={
                                    processing ||
                                    remainingPayment > 0
                                }
                                onClick={
                                    handleHandover
                                }
                            >
                                Serahkan Equipment
                            </button>
                        </div>
                    </div>
                )}

        </div>
    );
}
function Card({ title, children }) {
    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>
                {title}
            </h3>

            {children}
        </div>
    );
}


function Info({ label, value }) {
    return (
        <div style={styles.info}>
            <span style={styles.infoLabel}>
                {label}
            </span>

            <span style={styles.infoValue}>
                {value || "-"}
            </span>
        </div>
    );
}


function RentalStatus({ status }) {
    const config = {
        PENDING_PAYMENT: [
            "Menunggu Pembayaran",
            "#fef2f2",
            "#dc2626",
        ],

        WAITING_CONFIRMATION: [
            "Menunggu Konfirmasi",
            "#fffbeb",
            "#b45309",
        ],

        CONFIRMED: [
            "Dikonfirmasi",
            "#eff6ff",
            "#2563eb",
        ],

        READY_FOR_PICKUP: [
            "Siap Diambil",
            "#eff6ff",
            "#2563eb",
        ],

        RENTED: [
            "Sedang Disewa",
            "#faf5ff",
            "#7e22ce",
        ],

        COMPLETED: [
            "Selesai",
            "#f0fdf4",
            "#15803d",
        ],

        CANCELLED: [
            "Dibatalkan",
            "#f3f4f6",
            "#6b7280",
        ],
    };

    const current =
        config[status] || [
            status,
            "#f3f4f6",
            "#6b7280",
        ];

    return (
        <span
            style={{
                padding: "8px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: current[1],
                color: current[2],
            }}
        >
            {current[0]}
        </span>
    );
}


const styles = {
    back: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        marginBottom: 20,
        color: "#6b7280",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 25,
    },

    label: {
        fontSize: 10,
        fontWeight: 700,
        color: "#9ca3af",
    },

    title: {
        margin: "4px 0",
        fontSize: 26,
    },

    created: {
        color: "#9ca3af",
        fontSize: 11,
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: 15,
        marginBottom: 25,
    },

    card: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
    },

    cardTitle: {
        margin: "0 0 15px",
        fontSize: 14,
    },

    info: {
        display: "flex",
        justifyContent: "space-between",
        gap: 15,
        padding: "9px 0",
        borderBottom: "1px solid #f3f4f6",
    },

    infoLabel: {
        color: "#9ca3af",
        fontSize: 11,
    },

    infoValue: {
        fontSize: 11,
        fontWeight: 600,
        textAlign: "right",
    },

    section: {
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 17,
        marginBottom: 12,
    },

    equipmentCard: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 20,
        marginBottom: 12,
    },

    equipmentHeader: {
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid #f3f4f6",
        paddingBottom: 15,
    },

    muted: {
        fontSize: 10,
        color: "#9ca3af",
        marginTop: 5,
    },

    unitTitle: {
        fontSize: 11,
        fontWeight: 700,
        margin: "16px 0 10px",
    },

    units: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
    },

    unit: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 190,
        textAlign: "left",
        padding: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        cursor: "pointer",
    },

    unitSelected: {
        border: "1px solid #2563eb",
        background: "#eff6ff",
    },

    unitCheck: {
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "1px solid #d1d5db",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
    },

    noUnit: {
        color: "#dc2626",
        fontSize: 11,
        padding: 10,
    },

    actionBar: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    confirmButton: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: 0,
        background: "#111827",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 9,
        fontWeight: 700,
        cursor: "pointer",
    },

    message: {
        padding: 30,
        textAlign: "center",
        color: "#6b7280",
    },

    error: {
        padding: 15,
        background: "#fef2f2",
        color: "#b91c1c",
        borderRadius: 10,
    },
    paymentWarning: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: 14,
        padding: 16,
        marginBottom: 25,
    },

    warningIcon: {
        width: 38,
        height: 38,
        minWidth: 38,
        borderRadius: "50%",
        background: "#f59e0b",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 18,
    },

    warningTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#92400e",
        marginBottom: 4,
    },

    warningText: {
        fontSize: 11,
        color: "#92400e",
        lineHeight: 1.6,
    },

    remainingBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        paddingLeft: 20,
        borderLeft: "1px solid #fde68a",
    },

    remainingLabel: {
        fontSize: 9,
        color: "#92400e",
        marginBottom: 3,
    },

    remainingAmount: {
        fontSize: 16,
        color: "#b45309",
    },

    payButton: {
        border: "1px solid #d97706",
        background: "#fffbeb",
        color: "#b45309",
        padding: "12px 18px",
        borderRadius: 9,
        fontWeight: 700,
        cursor: "pointer",
    },
};