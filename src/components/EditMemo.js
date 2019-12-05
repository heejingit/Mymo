import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
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

class EditMemo extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        memoId: 0,
        title: '',
        description: ''
      }
  }

  componentWillMount() {
    if (this.props.history.location.state === undefined) return this.props.history.push('/signin')
    const data = this.props.history.location.state
    this.setState({ memoId: data.memoId, title: data.title, description: data.description })
    console.log('a')
  }

  handleChange = (e) => {
      const {name, value} = e.target;
      this.setState({[name]: value});
  }

  handleSubmit = (e) => {
      e.preventDefault();

      if(window.confirm("Do you want to apply")) {
        const items = [this.state.memoId, this.state.title, this.state.description];
        ipcRenderer.send('edit-memo', items);
        return this.props.history.push('/memo');
      }
  }

  render() {
    const { classes } = this.props;
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <AssignmentIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Edit your memo
            </Typography>
            <form className={classes.form} onSubmit={this.handleSubmit} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="title"
                label="title"
                value={this.state.title}
                name="title"
                autoComplete="title"
                onChange={this.handleChange}
                autoFocus
              />
              <TextField
                id="outlined-multiline-static"
                placeholder="Placeholder"
                multiline
                fullWidth
                rows="7"
                variant="outlined"
                margin="normal"
                required
                value={this.state.description}
                name="description"
                label="description"
                type="description"
                onChange={this.handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Edit
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

export default withRouter(withStyles(styles)(EditMemo));