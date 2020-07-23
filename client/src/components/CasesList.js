import React, { Component } from 'react';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import getCases from '../actions/getCases'
import axios from 'axios'
import PropTypes from 'prop-types'

class CasesList extends Component{

  componentDidMount(){
    getCases();
  }

  render(){
    return (
      <List disablePadding dense>
        <ListItem button>
          <ListItemText>Home</ListItemText>
        </ListItem>
        <ListItem button>
          <ListItemText>Billing</ListItemText>
        </ListItem>
        <ListItem button>
          <ListItemText>Settings</ListItemText>
        </ListItem>
      </List>
    )
  }
}

export default CasesList;