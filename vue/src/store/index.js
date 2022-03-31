import { createStore } from "vuex";
import axiosClient from "../axios";


const store = createStore({
    state:{
        user: {
            data: {},
            token: sessionStorage.getItem("TOKEN"),
        },
        dashboard: {
            loading: false,
            data: {},
        },
        currentSurvey: {
            loading: false,
            data: {},
        },
        surveys: {
            loading: false,
            links: [],
            data: []
        },
        questionTypes: ["text","select","radio","checkbox","textarea"],
        notification: {
            show: false,
            type: null,
            message: null,
        },
    },
    getters:{},
    actions:{
        register({commit}, user) {
            return axiosClient.post('/register', user)
                    .then(({data}) => {
                        commit('setUser',data);
                        return data;
                    })
        },
        login({commit}, user) {
            return axiosClient.post('/login', user)
                    .then(({data}) => {
                        commit('setUser',data);
                        return data;
                    })
        },
        logout({commit}) {
            return axiosClient.post('/logout')
                    .then(response => {
                        commit('logout')
                        return response;
                    })
        },
        saveSurvey({commit}, survey) {
            delete survey.image_url
            let response;
            if (survey.id) {
                response = axiosClient.put(`/survey/${survey.id}`, survey).then((res) => {
                    commit("setCurrentSurvey", res.data);
                    return res;
                });
            } else {
                response = axiosClient.post("/survey", survey).then((res) => {
                    commit("setCurrentSurvey", res.data);
                    return res;
                });
            }
            return response;
        },
        deleteSurvey({},id) {
            return axiosClient.delete(`/survey/${id}`);
        },
        getSurvey({commit},id) {
            commit("setCurrentSurveyLoading", true);
            return axiosClient.get(`/survey/${id}`)
                              .then((res) => {
                                commit("setCurrentSurvey", res.data);
                                commit("setCurrentSurveyLoading", false);
                                return res;
                              })
                              .catch((err) => {
                                commit("setCurrentSurveyLoading",false);
                                throw err;
                              });
        },
        getSurveys({commit}, {url = null} = {}) {
            url = url || '/survey'
            commit('setSurveysLoading', true)
            return axiosClient.get(url).then((res) => {
                commit('setSurveysLoading', false)
                commit('setSurveys', res.data);
                return res;
            });
        },
        getSurveyBySlug({ commit}, slug) {
            commit("setCurrentSurveyLoading", true);
            return axiosClient.get(`/survey-by-slug/${slug}`)
                              .then((res) => {
                                  commit("setCurrentSurvey", res.data);
                                  commit("setCurrentSurveyLoading", false);
                                  return res;
                              }).catch((err) => {
                                commit("setCurrentSurveyLoading", false);
                                throw err;
                              });
        },
        saveSurveyAnswer({ commit}, {surveyId, answers}) {
            return axiosClient.post(`/survey/${surveyId}/answer`, {answers});

        },
        getDashboardData({ commit}) {
            commit('dashboardLoading', true)
            return axiosClient.get(`/dashboard`).then((res) => {
                commit('dashboardLoading',false)
                commit('setDashboardData',res.data)
                return res;
            }).catch(error => {
                commit('dashboardLoading',false)
                return error;
            })
        },
    },
    mutations:{
        logout: state => {
            state.user.data = {};
            state.user.token = null;
            sessionStorage.removeItem('TOKEN');
        },
        setUser: (state, userData) => {
            state.user.token = userData.token;
            state.user.data = userData.user;
            sessionStorage.setItem('TOKEN', userData.token);
        },
        setCurrentSurveyLoading: (state, loading) => {
            state.currentSurvey.loading = loading;
        },
        setSurveysLoading: (state, loading) => {
            state.surveys.loading = loading;
        },
        setCurrentSurvey: (state, survey) => {
            state.currentSurvey.data = survey.data;
        },
        setSurveys: (state, surveys) => {
            state.surveys.data = surveys.data;
            state.surveys.links = surveys.meta.links;
        },
        notify: (state, {message, type}) => {
            state.notification.show = true;
            state.notification.type = type;
            state.notification.message = message;
            setTimeout(() => {
                state.notification.show = false;
            }, 3000)
        },
        dashboardLoading: (state, loading) => {
            state.dashboard.loading = loading;
        },
        setDashboardData: (state, data) => {
            state.dashboard.data = data;
        },
    },
    modules:{},
})

export default store;