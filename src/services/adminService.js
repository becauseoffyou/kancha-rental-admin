const API_URL = "http://kancha-rental-api-production.up.railway.app/api";

const getWaitingPayments = async () => {
    const response = await fetch(
        `${API_URL}/payments/admin/waiting-verification`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mengambil pembayaran"
        );
    }

    return result.data;
};

const approvePayment = async (paymentReference) => {
    const response = await fetch(
        `${API_URL}/payments/admin/${encodeURIComponent(
            paymentReference
        )}/approve`,
        {
            method: "PATCH",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal memverifikasi pembayaran"
        );
    }

    return result.data;
};

const rejectPayment = async (
    paymentReference,
    reason
) => {
    const response = await fetch(
        `${API_URL}/payments/admin/${encodeURIComponent(
            paymentReference
        )}/reject`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                reason,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal menolak pembayaran"
        );
    }

    return result.data;
};

const getBookings = async () => {
    const response = await fetch(
        `${API_URL}/booking/admin/all`
    );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mengambil booking"
        );
    }

    return result.data;
};

const getBookingDetail = async (orderNumber) => {
    const response = await fetch(
        `${API_URL}/booking/admin/${encodeURIComponent(
            orderNumber
        )}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mengambil detail booking"
        );
    }

    return result.data;
};

const confirmBooking = async (
    orderNumber,
    assignments
) => {
    const response = await fetch(
        `${API_URL}/booking/admin/${encodeURIComponent(
            orderNumber
        )}/confirm`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                assignments,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mengkonfirmasi booking"
        );
    }

    return result;
};

const markReadyForPickup = async (
    orderNumber
) => {
    const response = await fetch(
        `${API_URL}/booking/admin/${encodeURIComponent(
            orderNumber
        )}/ready`,
        {
            method: "PATCH",
        }
    );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mengubah status"
        );
    }

    return result;
};


const payRemaining = async (
    orderNumber,
    payload
) => {
    const response = await fetch(
        `${API_URL}/payments/admin/${encodeURIComponent(
            orderNumber
        )}/remaining`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify(
                payload
            ),
        }
    );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal mencatat pelunasan"
        );
    }

    return result;
};


const handoverBooking = async (
    orderNumber
) => {
    const response = await fetch(
        `${API_URL}/booking/admin/${encodeURIComponent(
            orderNumber
        )}/handover`,
        {
            method: "PATCH",
        }
    );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Gagal menyerahkan equipment"
        );
    }

    return result;
};
const getPreparationBookingCount =
    async () => {
        const response = await fetch(
            `${API_URL}/booking/admin/preparation/count`
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Gagal mengambil jumlah booking"
            );
        }

        return Number(
            result.data.total || 0
        );
    };
const adminService = {
    getWaitingPayments,
    approvePayment,
    rejectPayment,
    getBookings,
    getBookingDetail,
    confirmBooking,
    markReadyForPickup,
    payRemaining,
    handoverBooking,
    getPreparationBookingCount,
};

export default adminService;