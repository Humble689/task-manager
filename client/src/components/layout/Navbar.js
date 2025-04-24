import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  AccountCircle,
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onToggleColorMode, mode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <DashboardIcon />
          Task Manager
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={onToggleColorMode} color="inherit">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>

          {user ? (
            <Box display="flex" alignItems="center">
              {user.id === 'guest' && (
                <Chip
                  label="Guest Mode"
                  color="secondary"
                  size="small"
                  sx={{ mr: 2 }}
                />
              )}
              <Tooltip title="Account">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                  }
                }}
              >
                {user.id !== 'guest' && (
                  <MenuItem onClick={handleClose} component={RouterLink} to="/profile">
                    <PersonIcon sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/register"
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 