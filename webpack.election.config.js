const path = require('path');

// Cibles navigateurs identiques en local et sur Jenkins, indépendamment de NODE_ENV/BROWSERSLIST_ENV
const BABEL_BROWSER_TARGETS = '>0.2%, not dead, not op_mini all';

// Constantes
const DEV = process.env.NODE_ENV === "dev";
const WEB_DIR = path.resolve(__dirname, '.');
const WEB_ELECTEUR_DIR = path.resolve(__dirname);
const DIST_FOLDER = path.resolve(WEB_DIR, 'src/main/webapp/includes/dist/');

// Charger les modules depuis web/node_modules
const ConcatPlugin = require(path.resolve(WEB_DIR, 'node_modules/@mcler/webpack-concat-plugin'));
const {CleanWebpackPlugin} = require(path.resolve(WEB_DIR, 'node_modules/clean-webpack-plugin'));
const MiniCssExtractPlugin = require(path.resolve(WEB_DIR, 'node_modules/mini-css-extract-plugin'));
const TerserPlugin = require(path.resolve(WEB_DIR, 'node_modules/terser-webpack-plugin'));
const {BundleAnalyzerPlugin} = require(path.resolve(WEB_DIR, 'node_modules/webpack-bundle-analyzer'));
const webpack = require(path.resolve(WEB_DIR, 'node_modules/webpack'));

const cryptoJsDependencies = require(path.resolve(WEB_DIR, "./src/main/webapp/includes/election/javascript/crypto-dependencies.js"));

let config = {
    context: WEB_DIR,
    mode: DEV ? 'development' : 'production',
    devtool: DEV ? 'source-map' : false,
    // Désactiver le cache pour builds reproductibles
    cache: false,
    entry: {
        app: path.resolve(WEB_DIR, 'src/main/webapp/includes/election/javascript/vox-react/src/index.tsx'),
    },
    output: {
        path: path.join(DIST_FOLDER, 'election/'),
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
        // Build reproductible : pas de chemins absolus dans le bundle
        pathinfo: false,
        devtoolModuleFilenameTemplate: '[resource-path]',
    },
    optimization: {
        minimize: !DEV,
        minimizer: [new TerserPlugin({
            extractComments: false,
            parallel: false,
            terserOptions: {
                // mangle:false → noms de variables laissés tels que Babel les produit,
                // garantit un bundle bit-à-bit identique quel que soit l'ordre de traitement des fichiers.
                mangle: false,
                compress: {
                    sequences: false,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    // join_vars peut fusionner des déclarations dans un ordre non déterministe
                    join_vars: false,
                    passes: 1,
                },
                format: {
                    comments: false,
                    beautify: false,
                },
            },
        })],
        chunkIds: 'deterministic',
        moduleIds: 'deterministic',
        mangleExports: false,
        // Désactive la fusion de modules (scope hoisting) — l'ordre de fusion dépend
        // du traversal de node_modules et varie selon l'image Docker
        concatenateModules: false,
        // Hash basé sur le contenu réel
        realContentHash: true,
    },
    experiments: {
        topLevelAwait: true
    },
    module: {
        rules: [
            // Règle spéciale pour les fichiers .mjs Emscripten (builds reproductibles)
            // Remplace import.meta.url par une chaîne vide pour éviter les chemins absolus
            {
                test: /\.mjs$/,
                include: /mjs/,
                type: 'javascript/auto',
                resolve: {
                    fullySpecified: false
                },
                use: [{
                    loader: 'string-replace-loader',
                    options: {
                        search: 'var _scriptName = import.meta.url;',
                        replace: 'var _scriptName = "";',
                    }
                }]
            },
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // Désactiver la recherche de babel.config.json/babelrc dans le CWD
                        // → config auto-suffisante, indépendante du répertoire d'exécution
                        configFile: false,
                        babelrc: false,
                        cacheDirectory: false,
                        presets: [
                            ['@babel/preset-env', { targets: BABEL_BROWSER_TARGETS }],
                            '@babel/react',
                            '@babel/preset-typescript'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-optional-chaining',
                            '@babel/plugin-proposal-nullish-coalescing-operator',
                            '@babel/plugin-transform-runtime',
                            '@babel/plugin-syntax-top-level-await'
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {publicPath: '../'}
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {publicPath: '../'}
                    },
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {publicPath: '../'}
                    },
                    {
                        loader: 'css-loader',
                        options: {importLoaders: 1}
                    }
                ]
            },
            {
                test: /\.(jpe?g|gif|png|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            },
            {
                test: /\.(woff|woff2|otf|eot|ttf)(\?[a-z\d=.]+)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            },
        ]
    },
    resolve: {
        modules: [path.resolve(WEB_DIR, 'node_modules')],
        extensions: ['.tsx', '.ts', '.js', '.mjs'],
        alias: {
            // Alias relatifs au contexte pour éviter les chemins absolus dans le bundle
            root: path.resolve(WEB_DIR),
            src: path.resolve(WEB_DIR, 'src')
        },
        // Utiliser des chemins relatifs dans le bundle
        symlinks: false,
        fallback: { "crypto": false },
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                path.resolve(DIST_FOLDER, 'election/**/*')
            ],
            dangerouslyAllowCleanPatternsOutsideProject: true,
            dry: false
        }),
        new ConcatPlugin({
            name: 'crypto.bundle',
            fileName: '[name].js',
            filesToConcat: cryptoJsDependencies
        }),
        new MiniCssExtractPlugin({filename: "[name].style.css"}),
        new BundleAnalyzerPlugin({
            analyzerMode: DEV ? 'static' : 'disabled',
            openAnalyzer: false,
            reportFilename: 'election-report.html'
        }),
        new webpack.ProvidePlugin({
            "React": "react",
        }),
    ],
    watchOptions: {
        aggregateTimeout: 300,
        ignored: /node_modules/,
        poll: 1000
    },
};

module.exports = config;