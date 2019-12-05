import React from 'react';
import decode from 'jwt-decode';
import { Redirect } from 'react-router-dom';

export default class Authentication {
    setToken(Token) {
        // Saves user token to localStorage
        localStorage.setItem('token', Token)
    }

    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('token')
    }

    logout() {
        localStorage.removeItem('token');
        return <Redirect to='/signin' /> //doing redirect here.
    }

    plainLogout() {
        localStorage.removeItem('token');
    }
  
    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken() // Getting token from localstorage
        return !!token && !this.isTokenExpired(token) // handwaiving here
    }

    isTokenExpired() {
        try {
            const decoded = decode(this.getToken());
            if (decoded.exp < Date.now() / 1000) { // Checking if token is expired. N
                return true;
            }
            else
                return false;
        }
        catch (err) {
            return false;
        }
    }

    parseJwt(token) {
        token = this.getToken();
        if (!token) { return; }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    loginProtectedRoute(props) {
        if(this.loggedIn()) return props.history.push('/memo');
    }

    dataProtectedRoute(props) {
        if(!this.loggedIn()) return props.history.push('/signin');
    }
}