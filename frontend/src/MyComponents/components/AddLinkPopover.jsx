import { useState, useEffect } from "react";
import { Popover, Stack, TextField, Button } from "@mui/material";

const AddLinkPopover = ({ anchorEl, onClose, onApply, initialUrl = "" }) => {
    
  const open = Boolean(anchorEl);
  const id = open ? "add-link-popover" : undefined;

  const [linkUrl, setLinkUrl] = useState(initialUrl);

  useEffect(() => {
    if (open) {
      setLinkUrl(initialUrl);
    }
  }, [open, initialUrl]);

  const handleApply = () => {
    if (!linkUrl.trim()) {
      onClose();
      return;
    }

    try {
      new URL(linkUrl);
      onApply(linkUrl);
      onClose();
    } catch {
      // alert("❌ Please enter a valid URL");
    }
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      sx={{ zIndex: 3001 }}
    >
      <Stack spacing={1} p={2} sx={{ width: 300 }}>
        <TextField
          placeholder="Enter URL"
          variant="outlined"
          autoComplete="off"
          size="small"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
            if (e.key === "Escape") {
              onClose();
            }
          }}
          autoFocus
        />
        <Button variant="contained" onClick={handleApply} size="small">
          Apply
        </Button>
      </Stack>
    </Popover>
  );
};

export default AddLinkPopover;