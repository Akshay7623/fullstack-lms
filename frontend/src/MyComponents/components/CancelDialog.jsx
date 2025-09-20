import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox
} from "@mui/material";

const CancelDialog = ({ open, onClose, onSubmit }) => {
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleAll, setRescheduleAll] = useState(true);


  useEffect(() => {
    if (open) {
      setCancelReason("");
    }
  }, [open]);

  const handleConfirmCancel = () => {
    if (onSubmit) {
      onSubmit(cancelReason.trim(), rescheduleAll);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cancel Lecture</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide a reason for cancelling this lecture:
        </DialogContentText>
        <TextField
          autoFocus
          multiline
          rows={5}
          margin="dense"
          placeholder="Enter cancellation reason"
          fullWidth
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          variant="outlined"
          sx={{
            mt: 2,
            "& .MuiInputBase-root": {
              fontSize: "0.87rem",
              padding: "12px",
            },
          }}
        />

        <Stack direction="row" alignItems="center" sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rescheduleAll}
                onChange={(e) => setRescheduleAll(e.target.checked)}
              />
            }
            label="Reschedule this lecture and all subsequent lectures?"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleConfirmCancel}
          disabled={cancelReason.trim().length === 0}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelDialog;