import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

const EditTopicDialog = ({ open, initialTopic, onClose, onSave }) => {
  const [topic, setTopic] = useState(initialTopic || "");

  React.useEffect(() => {
    setTopic(initialTopic || "");
  }, [initialTopic, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ mt: 2 }}>Edit Topic</DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Lecture Topic"
          autoComplete="off"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          fullWidth
          autoFocus
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(topic)}
          disabled={!topic.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTopicDialog;