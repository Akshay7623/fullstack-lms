import React, { useEffect, useState } from "react";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Add, Trash as Delete } from "iconsax-react";
import config from "../config";

const breadcrumbLinks = [
  { title: "trainers", to: "/trainers" },
  { title: "modules" },
];

const Module = () => {
  const [modules, setModules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [moduleName, setModuleName] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, module: null });

  const fetchModules = async () => {
    try {
      const resp = await fetch(`${config.hostUrl}/api/module/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await resp.json();
      if (resp.status === 200) setModules(data.data || []);
    } catch (Err) {
      setToast({ open: true, message: "Failed to fetch modules", severity: "error" });
    }
  };

  const handleOpenDialog = (module = null) => {
    setEditModule(module);
    setModuleName(module ? module.name : "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditModule(null);
    setModuleName("");
  };

  const handleSave = async () => {

    if (!moduleName.trim()) {
      setToast({ open: true, message: "Module name required", severity: "error" });
      return;
    }

    try {
      const url = editModule
        ? `${config.hostUrl}/api/module/update`
        : `${config.hostUrl}/api/module/add`;
      const method = editModule ? "PUT" : "POST";
      const body = editModule
        ? JSON.stringify({ _id: editModule._id, name: moduleName })
        : JSON.stringify({ name: moduleName });
      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body,
      });

      if (resp.status === 200) {
        setToast({
          open: true,
          message: editModule ? "Module updated" : "Module created",
          severity: "success",
        });
        fetchModules();
        handleCloseDialog();
      } else {
        setToast({ open: true, message: "Failed to save module", severity: "error" });
      }
    } catch {
      setToast({ open: true, message: "Error saving module", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const resp = await fetch(`${config.hostUrl}/api/module/delete?_id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (resp.status === 200) {
        setToast({ open: true, message: "Module deleted", severity: "success" });
        setModules((prev) => prev.filter((m) => m._id !== id));
      } else {
        setToast({ open: true, message: "Failed to delete", severity: "error" });
      }
    } catch {
      setToast({ open: true, message: "Error deleting module", severity: "error" });
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <>
      <Breadcrumbs custom heading="modules" links={breadcrumbLinks} />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Module List</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Module
          </Button>
        </Stack>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modules.map((mod) => (
              <TableRow key={mod._id}>
                <TableCell>{mod.name}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(mod)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => setConfirmDialog({ open: true, module: mod })}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {modules.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No modules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editModule ? "Edit Module" : "Add Module"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Module Name"
            autoFocus={true}
            value={moduleName}
            onChange={(e) => {
              setModuleName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
            fullWidth
            sx={{ mt: 1 }}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={moduleName.trim().length === 0}>
            {editModule ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, module: null })}
      >
        <DialogTitle>Delete Module</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the module <b>{confirmDialog.module?.name}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, module: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleDelete(confirmDialog.module._id);
              setConfirmDialog({ open: false, module: null });
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Module;