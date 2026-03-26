# ABOUTME: OAuth callback handler for Supabase Auth
# ABOUTME: Handles the OAuth redirect and stores session in session_state

import streamlit as st
import logging
import os
from auth import init_supabase_client, get_current_user
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
ENV_PATH = ROOT_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OAuthCallback")

REDIRECT_URL = os.getenv("REDIRECT_URL", "http://localhost:8501/callback")
APP_URL = REDIRECT_URL[:-len("/callback")] if REDIRECT_URL.endswith("/callback") else REDIRECT_URL.rstrip("/")

def handle_callback():
    """Handle the OAuth callback."""
    st.set_page_config(
        page_title="Processing Login...",
        page_icon="🔄",
        layout="centered"
    )

    st.title("🔄 Processing your login...")

    with st.spinner("Verifying your account..."):
        try:
            # Initialize Supabase client
            supabase = init_supabase_client()

            # Get the session from the URL
            session = supabase.auth.get_session()

            if session and session.user:
                # Store session in Streamlit session state
                st.session_state["user"] = session.user
                st.session_state["session"] = session

                logger.info(f"User authenticated successfully: {session.user.email}")

                st.success(f"✅ Welcome, {session.user.email}!")
                st.info("Redirecting to Quibo...")

                # Wait a moment for the session to be stored
                st.empty().write("")

                # Redirect to main app after a short delay
                st.markdown("""
                <meta http-equiv="refresh" content="2; url={app_url}">
                """.format(app_url=APP_URL), unsafe_allow_html=True)

                st.warning("If you're not redirected automatically, click here:")
                st.markdown(f"[Go to Quibo]({APP_URL})")

            else:
                st.error("❌ No session found. Please try logging in again.")
                st.markdown(f"[Back to Login]({APP_URL})")

        except Exception as e:
            logger.error(f"Callback error: {e}")
            st.error(f"❌ Authentication failed: {str(e)}")
            st.markdown(f"[Back to Login]({APP_URL})")

if __name__ == "__main__":
    handle_callback()
