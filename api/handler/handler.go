package handler

import mgo "gopkg.in/mgo.v2"

// Handler --
type Handler struct {
	DB    *mgo.Session
	Files map[string]string
}
