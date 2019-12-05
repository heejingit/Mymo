import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Authentication from './Authentication';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

// from https://material-ui.com/getting-started/templates/

var electron = window.require('electron')
var {ipcRenderer} = electron

function Copyright() {
  return (
    <Typography variant="body2" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Mymo
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});


class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          email: '',
          password: '',
          isLoggedIn: false
        }
        this.auth = new Authentication();
    }

    componentWillMount() {
        if(this.auth.loggedIn && this.auth.parseJwt()) {
            return this.props.history.push('/memo') 
        };
    }

    // Get the data of the id logged in
    componentDidMount() {
        ipcRenderer.on('signedin', (e, data) => {                   // Receives data from the main window
            this.auth.setToken(data[1]);                            // Save the token into localStrage
            ipcRenderer.send('prepare-memo', this.auth.parseJwt().email)
            return this.props.history.push({                        // Redirect to memo page
                pathname: '/memo',
                state: { email: data[0] }
            })                 
        })
    }
  
    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }
  
    handleSubmit = (e) => {
        e.preventDefault();
  
        const items = [this.state.email, this.state.password];
        ipcRenderer.send('signin-userInfo', items);
    }
  
    render() {
        const { classes } = this.props;
        return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} onSubmit={this.handleSubmit} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={this.handleChange}
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={this.handleChange}
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/register">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      );
  }
}

export default withRouter(withStyles(styles)(SignIn));