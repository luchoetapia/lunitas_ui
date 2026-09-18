const priceFormatter = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value)
}

export { priceFormatter }