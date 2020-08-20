import queryString from 'query-string'

class PageContext {
    constructor () {
        this.location = window.location
        this.templateHandle = 'unknown'
        this.templateType = 'unknown'
    }

    setTemplate (templateName) {
        this.templateHandle = templateName
        this.templateType = this.determineTemplateType(this.templateHandle)
    }

    onPathname (pathname) {
        return this.location.pathname.toLowerCase() === pathname.toLowerCase()
    }

    onTemplate (templateName) {
        return this.templateHandle === templateName
    }

    onTemplateType (templateType) {
        return this.templateType === templateType
    }

    getPathname () {
        return this.location.pathname
    }

    getFragment () {
        return this.location.hash
    }

    getQueryString () {
        return this.location.search
    }

    getQueryParam (key) {
        return queryString.parse(this.location.search)[key]
    }

    /**
   * Returns name of the current page template, i.e. 'customers/account.esc'
   */
    getTemplate () {
        return this.templateHandle
    }

    /**
   * Returns type of current page template, i.e. 'customers/account'
   */
    getTemplateType () {
        return this.templateType
    }

    determineTemplateType (templateName) {
        return templateName.split('.')[0]
    }
}

export default new PageContext()
