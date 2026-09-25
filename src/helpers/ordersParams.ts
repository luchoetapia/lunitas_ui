export const orderSellingChannelParams: Record<string, { color: string, label: string }> = {
    "LOCAL": { color: "#A67984", label: "Local Flores" },
    "WHATSAPP": { color: "#25D366", label: "WhatsApp" },
    "FACEBOOK": { color: "#1877F2", label: "Facebook" },
    "INSTAGRAM": { color: "#C13584", label: "Instagram" },
    "MERCADO_LIBRE": { color: "#FFE600", label: "Mercado Libre" },
}

export const orderStatusParams: Record<string, { color: string, label: string }> = {
    "PENDING": { color: "#A8A8A8", label: "Pendiente" },
    "IN_PROGRESS": { color: "#E8A33D", label: "En Proceso" },
    "TO_DELIVER": { color: "#6B9C5D", label: "Para Entregar" },
    "DELIVERED": { color: "#A67984", label: "Entregado" },
    "CANCELLED": { color: "#E4574B", label: "Cancelado" },
}

// Pickup spot shown when an order has no shipping. Expected to grow as new
// pickup locations are added — extend this map (and OrderSchema's
// pickupLocationEnum) rather than hardcoding options elsewhere.
export const orderPickupLocationParams: Record<string, { color: string, label: string }> = {
    "LOCAL_FLORES": { color: "#A67984", label: "Local Flores" },
    "TALLER": { color: "#6B9C5D", label: "Taller" },
}