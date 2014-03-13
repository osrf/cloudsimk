jenkins:
	@JUNIT_REPORT_PATH=report.xml ./node_modules/.bin/mocha --reporter mocha-jenkins-reporter || true

lint:
	find ./lib ./routes  -name "*.js" -print0 | xargs -0 ./node_modules/jslint/bin/jslint.js

install:
	npm install

.PHONY: jenkins
