import * as React from "react"
import {Box, Button, Snackbar} from "@mui/material"

export function CopyButton(props: { text: string }) {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("Text in Zwischenablage kopiert.")
  const handleClick = () => {
    if(navigator.clipboard === undefined) {
      setMessage("Zwischenablage ist für HTTP deaktiviert.")
      setOpen(true)
      return
    }
    navigator.clipboard.writeText(props.text).then(function () {
      },
      function () {
        setMessage("Text konnte nicht kopiert werden.")
      })
    setOpen(true)
  }
  return <>
    <Box sx={{display: 'flex', justifyContent: 'right'}}>
      <Button onClick={handleClick}>Kopieren</Button>
    </Box>
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={() => {
        setOpen(false)
      }}
      message={message}
      ContentProps={{sx: {bgcolor: 'primary.light'}}}
    />
  </>
}
