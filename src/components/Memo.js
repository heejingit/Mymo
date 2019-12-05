import React from 'react'
import Authentication from './auth/Authentication'
import VerticalTabs from './VerticalTabs';
import FullWidthTabs from './FullWidthTaps';
import { withRouter } from 'react-router-dom';

var electron = window.require('electron')
var {ipcRenderer} = electron

class Memo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            memos: '',
        }
        this.auth = new Authentication();
    }

    componentDidMount() {
        this.auth.dataProtectedRoute();
        ipcRenderer.send('prepare-memo', this.auth.parseJwt().email)
    }

    render() {
        return (
            <div>
                <FullWidthTabs />
                <VerticalTabs />
            </div>
        )  
    }
}


export default withRouter(Memo)