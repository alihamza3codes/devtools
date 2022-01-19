<?php 
    // Check if login
    function isLogin(){
        global $session;
        global $db;
        $user_id = $session->get("user_id");
        if (!$user_id) {
            return false;
        }
        // Validate user
        $user = $db->selectSingle("users", [
            "id" => $user_id
        ]);
        if(!$user){
            $session->unset("user_id");
            return false;
        }
        $check_user_role = $db->selectSingle("users_roles", [
            "id" => $user['role_id']
        ]);
        if($check_user_role){
            $user['role'] = $check_user_role['role'];
        } else $user['role'] = '';
        $l_user = $user;
        $l_user['is_admin'] = false;
        if ($user) {
            if ($user["role_id"] == "1") {
                $l_user['is_admin'] = true;
            }
        }
        return $l_user;
    }
    // Get Project Data
	function getProject(array $data){
		global $db;
		$p = [];
		if(isset($data['version_id'])){
			$version = $db->selectSingle("projects_versions", ['encrypt_id' => $data['version_id']]);
			if($version){
				$project = $db->selectSingle("projects", ['id' => $version['project_id']]);
				if($project){
					$p = $project;
					$p['version'] = $version;
				}
			}
		}
		return $p;
	}
    // check access
	function has_access($keyword, $condition = [], $check_admin = true)
    {
        global $db, $user_id, $is_admin;
        if($check_admin && $is_admin) return true;
        $table_name = "";
        $selector = "";
        $to_match_with = "";
        $data = [];
        $type_id = "";
        $table_names = [];
        $data_selector = isset($condition["data_selector"]) ? $condition["data_selector"] : "id";
        $action = isset($condition["action"]) ? $condition["action"] : "all";
        $userId =  isset($condition["user_id"]) ? $condition["user_id"] : $user_id;
        $multiple_tables = false;
        $permission_type = $db->selectSingle("permissions_types", [
            "keyword" => $keyword
        ]);
        if ($permission_type) {
            $table_name = $permission_type["table_name"];
            $temp_table_name = explode(",", $table_name);
            if (count($temp_table_name) > 1) {
                $multiple_tables = true;
                $table_names = $temp_table_name;
            }
            $selector = $permission_type["selector"];
            $type_id = $permission_type["id"];
        }
        if ($selector == "url") {
            if (!(empty($condition)) && array_key_exists("url", $condition)) {
                $to_match_with = $condition["url"];
            } else $to_match_with = get_current_path();
        } else if ($selector == "encrypt_id") {
            if (array_key_exists("encrypt_id", $condition)) {
                $to_match_with = $condition["encrypt_id"];
            }
        }
        $data[$selector] = $to_match_with;
        $item = "";
        if ($multiple_tables) {
            foreach ($table_names as $tableName) {
                $tmp_item = $db->selectSingle($tableName, $data);
                if ($tmp_item) {
                    $item = $tmp_item;
                }
            }
        } else {
            $item = $db->selectSingle($table_name, $data);
        }
        if ($item) {
            $permissions = $db->select("user_content_permissions", [
                "item_id" => $item[$data_selector],
                "user_id" => $userId,
                "type_id" => $type_id,
                "action" => $action
            ]);
            if ($permissions) return true;
            return false;
        }
    }

class NC_FUNCTIONS{
    private $dir;
    public $path = [];
    private $folders = [];
    public function __construct($dir){
        $this->dir = $dir;
        $this->folders = [
            "views" => $this->dir . "views/"
        ];
    }
    // Make file name php
    private function makePHP($file){
        $file = rtrim($file, ".php");
        return $file . ".php";
    }
    // Trim path
    private function trimPath($file){
        $file = rtrim($file, '/');
        $file = ltrim($file, '/');
        return $file;
    }
    // Get path
    private function path($type){
        $path = '';
        if(isset($this->path[$type])){
            $path = $this->path[$type];
            $path = $this->trimPath($path) . "/";
        }

        if(isset($this->folders[$type])) $path = $this->folders[$type] . $path;
        return $path;
    }
    // Include a view
    public function view($file){
        $file = $this->makePHP($file);
        return require_once($this->path('views') . $file);
    }

}
$fn = new NC_FUNCTIONS(isset($global_dir) ? $global_dir : "./");