import { TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'
import type { ChangeEvent } from 'react'
import { priceFormatter } from '../../helpers/utils'

interface CurrencyFieldProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
    // Raw digits only (e.g. "12000"), as kept in form state.
    value: string
    onChange: (rawValue: string) => void
}

// Price/amount input styled like currency: shows "$ 12.000" while typing (see
// ProductModelFields' price field, which this mirrors) and, being type="text",
// has no up/down arrows. Typing only ever adds/removes digits, so the raw
// amount is recovered by stripping everything that isn't one.
function CurrencyField({ value, onChange, ...textFieldProps }: CurrencyFieldProps) {
    const displayValue = value ? priceFormatter(Number(value)) : ''

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value.replace(/\D/g, ''))
    }

    return (
        <TextField
            {...textFieldProps}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
        />
    )
}

export default CurrencyField
