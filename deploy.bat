git log -1 --date=format:"%%Y/%%m/%%d %%T %%z" --format="%%ad">dateTimeLastCommit.txt
set /p dateTimeLastCommit=<dateTimeLastCommit.txt
del dateTimeLastCommit.txt
powershell -command "(gc '%~dp0\package.json') -replace '(\"datetimedeploy\": \")(.{0,})(\",)', '${1}%dateTimeLastCommit%${3}' | Out-File -encoding ASCII '%~dp0\package.json'"
yarn predeploy
yarn deploy