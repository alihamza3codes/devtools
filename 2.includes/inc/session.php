<?php
	use Firebase\JWT\JWT;

	class SESSION{
		private $key = "Wnz7xhTJRSH0YqO0xFz09QOZZLs608";
		private $algorithm = 'HS256';
		private $cookie_name = '';
		private $token = '';
		public $data = [];
		private $token_set = false;
		public function __construct($cookie_name = ''){
			if($cookie_name === '')
				$this->cookie_name = $this->get_cookie_name();
			else 
				$this->cookie_name = $cookie_name;
			// Get Token
			if(isset($_COOKIE[$this->cookie_name])){
				$this->token = $_COOKIE[$this->cookie_name];
				if($this->check($this->token)){
					$this->token_set = true;
					$data = $this->decode_token($this->token);
					$tmpData = [];
					foreach($data as $key => $value){
						$tmpData[$key] = $value;
					}
					if($data) $this->data = $tmpData;
				}
			}
		}
		private function isExpired($date1, $date2){
			$date = new DateTime($date1);
			$expire_date = new DateTime($date2);

			if($expire_date < $date) return true;
			else return false;
		}
		// Check 
		private function check($token){
			global $db;
			$valid = false;
			$token = $db->selectSingle("session_tokens", ['token' => $token]);
			if($token){
				if($token['expired'] == 0) $valid = true;
				$current_time = date("Y-m-d h:i:s");
				$expired_time = date("Y-m-d h:i:s", strtotime($token['expire_at']));
				if(!$this->isExpired($current_time, $expired_time)) $valid = true;
			}
			return $valid;
		}
		// Decode Token
		private function decode_token($token){
			try {
				$data = JWT::decode($token, $this->key, [$this->algorithm]);
				return $data;
			} catch (\Throwable $th) {
				return false;
			}
		}
		// Get cookie name
		private function get_cookie_name(){
	        global $site_name;
	        $split = explode(" ", $site_name);
	        $name = '';
	        foreach ($split as $word) {
	            if (strlen($word) > 0) {
	                $firstLetter = strtolower($word[0]);
	                $name .= $firstLetter;
	            }
	        }
	        return $name . "_s";
	    }
		public function get($key){
			if(isset($this->data[$key])){
				return $this->data[$key];
			} else {
				return false;
			}
		}
		public function getAll(){
			$data = $this->data;
			unset($data['rn']);
			return $data;
		}
		// Throw Error
		private function error($error){
			throw new Error($error, 1);
		}
		// Set JWT Token
		private function encode_token(){
			$tmp = '';
			foreach($this->data as $value){ $tmp = $value; }
			$this->data['rn'] = md5($tmp) . getRandom(30);
			$this->data['ip'] = $_SERVER['REMOTE_ADDR'];
			$jwt = JWT::encode($this->data, $this->key, $this->algorithm);
			return $jwt;
		}
		// Save Session
		private function save_session($data){
			global $db;
			$insert = $db->insert("session_tokens", [
				"token" => $data['token'],
				"expired" => 0,
				"issue_at" => $data['issue_at'],
				"expire_at" => $data['expire_at']
			]);
			if($insert){
				$expireAt = strtotime($data['expire_at']);
				setcookie($this->cookie_name, $data['token'], $expireAt, '/');
				$this->token = $data['token'];
				$this->token_set = true;
			}
		}
		// Update Session
		private function update(){
			global $db;
			$updated = false;
			$tokenData = $db->selectSingle("session_tokens", ['token' => $this->token]);
			if($tokenData){
				$new_token = $this->encode_token();
				$update = $db->update("session_tokens", [
					"token" => $new_token
				], ['id' => $tokenData['id']]);
				if($update){
					$expireAt = strtotime($tokenData['expire_at']);
					setcookie($this->cookie_name, $new_token, $expireAt, '/');
					$this->token = $new_token;
					$updated = true;
				}
			}
			return $updated;
		}
		public function set($data, string $expireAt = '+ 10 days'){
			foreach($data as $key => $value){
				$this->data[$key] = $value;
			}
			if($this->token_set){
				return $this->update();
			}
			$issueAt = date("Y-m-d h:i:s");
			$expireAt = date("Y-m-d h:i:s", strtotime($issueAt . ' ' . $expireAt));

			// Create token
			$token = $this->encode_token();
			$this->save_session([
				"token" => $token,
				"issue_at" => $issueAt,
				"expire_at" => $expireAt
			]);
		}
		public function unset($session_name){
			if(!$this->token_set) return false;
			unset($this->data[$session_name]);
			$this->update();
		}
		public function destroy(){
			global $db;
			$db->update("session_tokens", ['expired' => true], ['token' => $this->token]);
			$cookie_time = date("Y-m-d h:i:s", strtotime(time() . " - 5 days"));
			setcookie($this->cookie_name, '?', $cookie_time, '/');
			$this->token = '';
			$this->data = [];
			$this->token_set = false;
		}
	}
	$session = new SESSION();