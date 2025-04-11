FROM nginx:alpine

# Create app directory
WORKDIR /usr/share/nginx/html

# Copy the static files
COPY index.html .
COPY style.css .
COPY script.js .

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

