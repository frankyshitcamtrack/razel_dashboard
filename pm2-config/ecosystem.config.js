module.exports = {
    apps: [
        {
            name: "Razel Dashboard",
            cwd: "../backend",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production"
            }
        },

    ]
}