using System.Collections;
using System.Collections.Generic;
using Crest;
using SocketIOSharp.Server;
using UnityEngine;
using UnityEngine.Android;
using UnityEngine.InputSystem;

public class SailboatController : MonoBehaviour
{
    public BoatProbes boatSim;
    
    public Rigidbody boat;

    public float rudderForceMultiplier = 0.5f;
    public Transform rudder;
    private float _rudder;

    public float mainEngingePower = 4f;
    public Transform engine;
    private float _engine;

    private float _yGravityCenter = 0;

    private SocketIOServer server;

    // Start is called before the first frame update
    void Start()
    {
        server = new SocketIOServer(new SocketIOServerOption(80));
        server.Start();
        Debug.Log("Started!");
        InvokeRepeating(nameof(BroadcastData), 1, 1);
    }

    void BroadcastData()
    {
        Debug.Log("Should broadcast data!");
        foreach (var connection in server.Clients)
        {
            connection.Emit("bearing_update", transform.rotation.y);
        }
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        // fix center of gravity on boat
        if (_yGravityCenter <= 1.5f)
        {
            _yGravityCenter += 0.05f;
            boatSim._centerOfMass = new Vector3(0, _yGravityCenter, 0);
        }


        // apply forces
        boat.AddTorque(0, boat.velocity.magnitude * _rudder * rudderForceMultiplier, -6 * transform.rotation.z, ForceMode.Acceleration);
        boat.AddForce(transform.forward * (_engine * mainEngingePower), ForceMode.Acceleration);
        engine.Rotate(0, 0, _engine*20, Space.Self);
        
        
        // controls
        var gamepad = Gamepad.current;
        if (gamepad == null)
            return; // No gamepad connected.

        if (gamepad.rightTrigger.wasPressedThisFrame)
        {
            // 'Use' code here
        }

        Vector2 move = gamepad.leftStick.ReadValue();
        ChangeRudder(move.x);
        ChangeEngine(move.y);
    }

    void ChangeRudder(float value)
    {
        _rudder = value;
        rudder.localRotation = Quaternion.Euler(-4.7f, value*30, 0f);
    }

    void ChangeEngine(float value)
    {
        _engine = value;
    }
}
