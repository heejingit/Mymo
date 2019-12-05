import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Authentication from './auth/Authentication'
import { Link } from 'react-router-dom';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew';

var electron = window.require('electron')
var {ipcRenderer} = electron

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 550,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  description: {
    marginRight: 150,
    marginTop: 50,
    height: 100
  },
  panelOptions: {
    marginTop: 200,
  },
  sharePanelOptions: {
    marginTop: 200,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
}));

const auth = new Authentication();

export default function VerticalTabs() {
  const classes = useStyles();
  const userEmail = auth.parseJwt().email;
  const [value, setValue] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [memos, setMemos] = React.useState([]);
  const [sharedMemos, setSharedMemos] = React.useState([]);
  const [memoId, setMemoId] = React.useState(0);
  const [selectedTitle, setSelectedTitle] = React.useState("");
  const [selectedDesc, setSelectedDesc] = React.useState("");
  const [ownedBy, setOwnedBy] = React.useState(0);
  const [lastIndex, setLastIndex] = React.useState(0);
  const items = [title, description, userEmail];

  useEffect(() => {
    ipcRenderer.on('user-memos', (e, data) => {
      setMemos(data);
      setLastIndex(data.length);
    })

    ipcRenderer.on('shared-memos', (e, data) => {
      setSharedMemos(sharedMemos => [...sharedMemos, data]);
    })
  }, [])

  console.log(sharedMemos);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    ipcRenderer.send('new-memo', items);
    window.location.reload();
  }

  const clickedDelete = () => {
    if (window.confirm("Are you sure to delete it?")) {
      ipcRenderer.send('delete-memo', memoId);
      window.location.reload();
    }
  }
  
  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
      <Tab label={<AddCircleIcon color="primary"/>} {...a11yProps(1000)} style={{ textAlign: 'left' }} />
        {memos.map(function(item, i) {
          return <Tab key={i} label={item.title} {...a11yProps(i)} onClick={() => {setMemoId(item.id); setSelectedTitle(item.title); setSelectedDesc(item.description); setOwnedBy(item.owned_by);} } />
        })}
        {sharedMemos.map(function(item, i) {
          return <Tab key={i} label={item.title} {...a11yProps(i+100)} style={{color: "red"}}/>
        })}
      </Tabs>
      <TabPanel value={value} index={0}>
        <Typography component="h1" variant="h5">
            Add a new memo
        </Typography>

        <form className={classes.form} onSubmit={handleSubmit} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                onChange={e => setTitle(e.target.value)}
                autoComplete="title"
                autoFocus
              />
              <TextField
                id="outlined-multiline-static"
                label="Multiline Placeholder"
                placeholder="Placeholder"
                multiline
                fullWidth
                rows="15"
                name="description"
                onChange={e => setDescription(e.target.value)}
                type="description"
                variant="outlined"
              />
              <br />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Upload
              </Button>
        </form>
      </TabPanel>
      {memos.map(function(item, idx) {
          return <TabPanel key={idx} value={value} index={idx+1}>
                    <Typography component="h1" variant="h2">
                        {item.title}
                    </Typography>
                    <Typography component="h3" variant="h5" className={classes.description}>
                        {item.description}
                    </Typography>

                    <Grid container className={classes.panelOptions}>
                      <Button
                          variant="contained"
                          color="secondary"
                          className={classes.button}
                          startIcon={<DeleteIcon />}
                          onClick={clickedDelete}
                        >
                          Delete
                      </Button>
                          <Button
                              variant="contained"
                              color="primary"
                              className={classes.button}
                              startIcon={<CloudUploadIcon />}
                              component={Link} to={{ pathname: '/edit', state: { memoId: memoId, title: selectedTitle, description: selectedDesc }}}
                            >
                              Edit
                        </Button>
                        <Button
                              variant="contained"
                              color="default"
                              className={classes.button}
                              startIcon={<AccessibilityNewIcon />}
                              component={Link} to={{ pathname: '/share', state: { memoId: memoId, ownedBy: ownedBy }}}
                            >
                              Share
                        </Button>
                    </Grid>
                 </TabPanel>
      })}


      {sharedMemos.map(function(item, idx) {
          return <TabPanel key={idx} value={value} index={lastIndex+idx+1} memo_id={item.id}>
                    <Typography component="h1" variant="h2">
                        {item.title}
                    </Typography>
                    <Typography component="h3" variant="h5" className={classes.description}>
                        {item.description}
                    </Typography>

                    <Grid container className={classes.sharePanelOptions}>
                      <Typography>
                          Shared by {item.owner_email}
                      </Typography>
                      <Typography style={{ fontSize: 13, color: 'grey' }}>
                          You can't edit or share if you don't own this memo.
                      </Typography>
                    </Grid>
                 </TabPanel>
      })} 
    </div>
  );
}
