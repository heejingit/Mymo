import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import PageviewIcon from '@material-ui/icons/Pageview';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Popover from '@material-ui/core/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
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
      backgroundColor: theme.palette.primary.main,
    },
    form: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 2, 2),
    },
});

class Share extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        memoId: 0,
        ownedId: 0,
        email: '',
        isInDatabase: false,
        isSameUser: false,
        conditionalString: 'This email does not exist',
        userList: [],
        userIdList: []
      }
  }

  componentWillMount() {
    this._isMounted = false;
    if (this.props.history.location.state === undefined) return this.props.history.push('/signin')
    const data = this.props.history.location.state
    this.setState({ memoId: data.memoId, ownedId: data.ownedBy });
  }

  componentDidMount() {
    ipcRenderer.on('share-same-user', (e, data) => {
      this.setState({isSameUser: true, conditionalString: 'You cannot share with yourself.'});
    });

    ipcRenderer.on('found-user', (e, data) => {
      this.setState({isInDatabase: true, conditionalString: 'It has been added!', userList: [...this.state.userList, data.email], userIdList: [...this.state.userIdList, data.id]});
    });
  }

  handleChange = (e) => {
      const {name, value} = e.target;
      this.setState({[name]: value});
  }

  handleSubmit = (e) => {
      e.preventDefault();

      ipcRenderer.send('share-user-email', [this.state.email, this.state.ownedId]);
  }

  handleShareSubmit = (e) => {
      e.preventDefault();

      ipcRenderer.send('share-list-users', [this.state.memoId, this.state.userIdList])
  }

  render() {
    const { classes } = this.props;
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <PageviewIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Who do you want to share with?
            </Typography>
            <form className={classes.form} onSubmit={this.handleSubmit} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Please input email"
                name="email"
                onChange={this.handleChange}
                autoFocus
              />
              <PopupState variant="popover" popupId="demo-popup-popover">
                {popupState => (
                  <div>
                    <Button {...bindTrigger(popupState)}
                      type="submit"
                      variant="contained"
                      color="primary"
                      className={classes.submit}
                    >
                      Add
                    </Button>
                    <Popover
                      {...bindPopover(popupState)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                    >
                      <Box p={2} >
                        <Typography>{this.state.conditionalString}</Typography>
                      </Box>
                    </Popover>
                  </div>
                )}
              </PopupState>
            </form>

            <form className={classes.form} onSubmit={this.handleShareSubmit} noValidate>
              <TextField
                  id="outlined-multiline-static"
                  label="List of Emails"
                  value={this.state.userList}
                  multiline
                  fullWidth
                  readOnly
                  rows="10"
                  name="description"
                  type="description"
                  variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className={classes.submit}
              >
                Share
              </Button>
            </form>
          </div>

          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      );
  }
}

export default withRouter(withStyles(styles)(Share));