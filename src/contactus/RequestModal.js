import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const RequestModal = ({ open, handleClose, title, children }) => {
    // Function to pass handleClose to children
    const renderChildren = React.Children.map(children, (child) => {
        // Check if child element is valid
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                handleClose: handleClose
            });
        }
        return child;
    });

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70vw', // Adjustable width
                    // height: '60vh',
                    bgcolor: 'background.paper',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: 24,
                    background:'#EAEAEA',
                    p: 2, // Padding
                }}
            >
                {/* <Typography id="simple-modal-title" variant="h6" component="h2">
                    {title}
                </Typography> */}
                <Box id="simple-modal-description">
                    {renderChildren}
                </Box>
                {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} variant="contained">
                        Close
                    </Button>
                </Box> */}
            </Box>
        </Modal>
    );
};

export default RequestModal;
