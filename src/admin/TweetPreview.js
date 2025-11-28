import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    TextField
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";

const TweetPreviewDialog = ({ open, onClose, onOk, tweet, tweetStatus }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(tweet || "");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Tweet Preview
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                    Generated Tweet
                </Typography>

                <TextField
                    multiline
                    fullWidth
                    minRows={6}
                    maxRows={12}
                    value={tweet}
                    sx={{ background: "#f8f8f8", borderRadius: 2 }}
                />




                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <span className={tweetStatus.includes("fail") ? "text-red-600 p-4" : tweetStatus === "sending" ? "text-blue-600 p-4" : "text-green-600   p-4"}>
                        {tweetStatus}
                    </span>
                    <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="error" variant="text">
                    Close
                </Button>

                <Button onClick={onOk} color="primary" variant="contained">
                    Tweet Now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TweetPreviewDialog;
